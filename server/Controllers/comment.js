import mongoose from "mongoose";
import comment from "../modals/comment.js";
import fetch from "node-fetch";
import CommentReaction from "../modals/commentReaction.js";

export const postComment = async (req, res) => {
  const { videoId } = req.params;
  const { userId, commentBody, userCommented, city: cityFromClient } = req.body;
  console.log(
    "{videoId,userId,commentBody,userCommented,}",
    videoId,
    userId,
    commentBody,
    userCommented
  );
  // Validate by blocking only unsafe special characters; allow most unicode text (e.g., Hindi)
  const disallowedPattern = /[<>\{\}\[\]\|\^~`]/; // minimal set considered unsafe
  if (!commentBody || disallowedPattern.test(commentBody)) {
    return res.status(400).json({ message: "Comment contains disallowed characters" });
  }

  // Determine city via IP geolocation (fallback to empty string). Trust proxy header first.
  let city = cityFromClient || "";
  try {
    if (!city) {
      const ip = (req.headers["x-forwarded-for"] || req.connection.remoteAddress || "").toString().split(",")[0].trim();
      if (ip) {
        const geoResp = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`);
        if (geoResp.ok) {
          const geo = await geoResp.json();
          city = geo?.city || "";
        }
      }
    }
  } catch (e) {
    // ignore geolocation failure
  }

  const postComment = new comment({
    videoId,
    userId,
    commentBody,
    userCommented,
    city,
  });
  try {
    await postComment.save();
    return res.status(200).json({ comment: true, commentDoc: postComment });
  } catch (error) {
    console.error("error:", error);
    return res.status(500).json({ message: "Somthing went wrong" });
  }
};

export const getAllComment = async (req, res) => {
  const { videoId } = req.params;
  try {
    const CommentsOfVideo = await comment
      .find({ videoId })
      .sort({ commentedOn: -1 }); // 👈 Newest first
    return res.status(200).json(CommentsOfVideo);
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteComment = async (req, res) => {
  const { commentId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    return res.status(404).send("Commnet unavailable");
  }
  try {
    await comment.findByIdAndDelete({ _id: commentId });
    return res.status(200).json("Comment deleted successfully");
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const editComment = async (req, res) => {
  const { commentId } = req.params;
  const commentData = req.body;
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    return res.status(404).send("Commnet unavailable");
  }
  try {
    // validate if updating the body
    if (typeof commentData?.commentBody === "string") {
      const disallowedPattern = /[<>\{\}\[\]\|\^~`]/;
      if (disallowedPattern.test(commentData.commentBody)) {
        return res.status(400).json({ message: "Comment contains disallowed characters" });
      }
    }
    const updateComment = await comment.findByIdAndUpdate(
      { _id: commentId },
      commentData,
      { new: true }
    );
    res.status(200).json({ comment: true, updateComment });
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Like/Dislike a comment; auto-delete when dislikes reach 2
export const reactToComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { userId, action } = req.body; // like | dislike | toggle patterns
    if (!mongoose.Types.ObjectId.isValid(commentId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid ids" });
    }

    const existing = await CommentReaction.findOne({ userId, commentId });
    let likeDelta = 0;
    let dislikeDelta = 0;
    let nextState = { liked: false, disliked: false };

    if (!existing) {
      // First reaction
      if (action === "like") {
        likeDelta = 1; nextState = { liked: true, disliked: false };
      } else if (action === "dislike") {
        dislikeDelta = 1; nextState = { liked: false, disliked: true };
      } else {
        return res.status(400).json({ message: "Invalid action" });
      }
      await CommentReaction.create({ userId, commentId, ...nextState });
    } else {
      // Toggle behavior with mutual exclusivity
      if (action === "like") {
        if (existing.liked) {
          likeDelta = -1; nextState = { liked: false, disliked: false };
        } else {
          likeDelta = 1; if (existing.disliked) dislikeDelta = -1; nextState = { liked: true, disliked: false };
        }
      } else if (action === "dislike") {
        if (existing.disliked) {
          dislikeDelta = -1; nextState = { liked: false, disliked: false };
        } else {
          dislikeDelta = 1; if (existing.liked) likeDelta = -1; nextState = { liked: false, disliked: true };
        }
      } else {
        return res.status(400).json({ message: "Invalid action" });
      }
      await CommentReaction.findOneAndUpdate(
        { userId, commentId },
        { $set: nextState },
        { new: true }
      );
    }

    const updated = await comment.findByIdAndUpdate(
      { _id: commentId },
      { $inc: { likes: likeDelta, dislikes: dislikeDelta } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Comment not found" });

    if (updated.dislikes >= 2) {
      await comment.findByIdAndDelete({ _id: commentId });
      await CommentReaction.deleteMany({ commentId });
      return res.status(200).json({ message: "Comment deleted due to dislikes", deleted: true });
    }
    return res.status(200).json({ message: "Reaction updated", comment: updated });
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Translate a comment body using a public translation API
export const translateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { targetLang, text: overrideText } = req.body; // e.g., 'en', 'hi', 'es'
    let text = overrideText || "";
    if (mongoose.Types.ObjectId.isValid(commentId)) {
      const doc = await comment.findById(commentId);
      if (doc && !overrideText) {
        text = doc.commentBody || "";
      }
    }
    if (!text) {
      return res.status(400).json({ message: "No text to translate" });
    }
    if (!targetLang) return res.status(400).json({ message: "targetLang is required" });
    if (!text.trim()) return res.status(400).json({ message: "Empty comment cannot be translated" });
    // Use libretranslate with multiple fallbacks and short timeouts
    const primary = process.env.TRANSLATE_API_URL || "https://translate.astian.org/translate";
    const apiKey = process.env.TRANSLATE_API_KEY;
    const payload = { q: text, source: "auto", target: targetLang || "en", format: "text" };
    if (apiKey) payload.api_key = apiKey;
    let translatedText = "";
    let ok = false;
    const timeoutMs = 6000;
    const requestWithTimeout = async (url, options = {}) => {
      return await Promise.race([
        fetch(url, options),
        new Promise((resolve) => setTimeout(() => resolve({ ok: false, status: 408, json: async () => ({}) }), timeoutMs)),
      ]);
    };
    const parseJsonSafe = async (resp) => {
      try {
        const ct = resp?.headers?.get && resp.headers.get('content-type');
        const isJson = ct && ct.includes('application/json');
        if (isJson) return await resp.json();
        // Fallback: try text then JSON.parse
        const txt = await (resp?.text ? resp.text() : Promise.resolve(""));
        try { return JSON.parse(txt); } catch { return null; }
      } catch { return null; }
    };
    const commonHeaders = { "Accept": "application/json", "Content-Type": "application/json", "User-Agent": "YourTubeCloneServer/1.0" };
    try {
      const r = await requestWithTimeout(primary, { method: "POST", headers: commonHeaders, body: JSON.stringify(payload) });
      if (r.ok) {
        const j = await parseJsonSafe(r);
        translatedText = j?.translatedText || j?.translation || "";
        ok = !!translatedText;
      }
    } catch {}
    if (!ok) {
      const backup = "https://libretranslate.de/translate";
      const r2 = await requestWithTimeout(backup, { method: "POST", headers: commonHeaders, body: JSON.stringify(payload) });
      if (r2.ok) {
        const j2 = await parseJsonSafe(r2);
        translatedText = j2?.translatedText || j2?.translation || "";
        ok = !!translatedText;
      }
    }
    if (!ok) {
      // Fallback to MyMemory (no key required). Use concrete source language; 'auto' is not supported.
      // If target is 'en' (same as our default source), skip MyMemory to avoid "PLEASE SELECT TWO DISTINCT LANGUAGES".
      const tgt = (targetLang || "en").toLowerCase();
      if (tgt !== "en") {
        const q = encodeURIComponent(text);
        const sourceForMyMemory = "en"; // use English as source by default
        const lp = encodeURIComponent(`${sourceForMyMemory}|${targetLang || "en"}`);
        const url = `https://api.mymemory.translated.net/get?q=${q}&langpair=${lp}`;
        try {
          const r3 = await requestWithTimeout(url, { headers: { "Accept": "application/json", "User-Agent": "YourTubeCloneServer/1.0" } });
          if (r3.ok) {
            const j3 = await parseJsonSafe(r3);
            translatedText = j3?.responseData?.translatedText || "";
            ok = !!translatedText;
          }
        } catch {}
      }
    }
    if (!ok) {
      // Last-resort unofficial Google endpoint (may change anytime)
      try {
        const q = encodeURIComponent(text);
        const tl = encodeURIComponent(targetLang || "en");
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${tl}&dt=t&q=${q}`;
        const r4 = await requestWithTimeout(url, { headers: { "Accept": "application/json", "User-Agent": "YourTubeCloneServer/1.0" } });
        if (r4.ok) {
          const j4 = await parseJsonSafe(r4);
          // j4[0] is an array of [translatedSegment, originalSegment, ...]
          if (Array.isArray(j4?.[0])) {
            translatedText = j4[0].map((seg) => seg?.[0] || "").join("");
            ok = !!translatedText;
          }
        }
      } catch {}
    }
    if (!ok) {
      // Return original text rather than error to avoid breaking UX
      return res.status(200).json({ translatedText: text, fallback: true, message: "Translation providers unavailable" });
    }
    return res.status(200).json({ translatedText, fallback: false });
  } catch (error) {
    console.error("translate error:", error);
    return res.status(500).json({ message: error?.message || "Server error during translation" });
  }
};
