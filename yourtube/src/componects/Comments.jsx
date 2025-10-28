import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { useState, useEffect } from 'react'
import { Textarea } from './UI/textarea';
import { Button } from './UI/Button2';
import { formatDistanceToNow } from 'date-fns';
import { useUser } from '../lib/AuthContext';
import axiosInstance from '../lib/axiosInstance';

const Comments = ({ videoId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editText, setEditText] = useState("");
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [targetLangById, setTargetLangById] = useState({}); // commentId -> lang
    const [translated, setTranslated] = useState({}); // commentId -> text

    useEffect(() => {
        loadComments();
        console.log(comments);
    }, [videoId]);

    const loadComments = async () => {
        if (!videoId) return;
        try {
            const response = await axiosInstance.get(`/comment/${videoId}`);
            setComments(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Loading history...</div>;
    }

    const hasOnlyAllowedChars = (text) => !(/[<>\{\}\[\]\|\^~`]/.test(text));

    const handleSubmitComment = async () => {
        if (!user || !newComment.trim()) return;
        if (!hasOnlyAllowedChars(newComment)) {
            alert('Comment contains disallowed characters.');
            return;
        }
        // Fetch city on client for accuracy when behind proxies
        let city = '';
        try {
            const ipResp = await fetch('https://ipapi.co/json/');
            if (ipResp.ok) {
                const ipData = await ipResp.json();
                city = ipData?.city || '';
            }
        } catch {}
        const response = await axiosInstance.post(`/comment/${videoId}`, {
            userId: user?._id,
            commentBody: newComment,
            userCommented: user.name || "Anonymous",
            city,
        });
        if (response.data.comment) {
            setIsSubmitting(true);
            const saved = response.data.commentDoc;
            if (saved) {
                setComments([saved, ...comments]);
            } else {
                // fallback optimistic
                const newCommentObj = {
                    _id: Date.now().toString(),
                    videoid: videoId,
                    userid: user.id,
                    commentBody: newComment,
                    userCommented: user.name || "Anonymous",
                    commentedon: new Date().toISOString(),
                };
                setComments([newCommentObj, ...comments]);
            }
        }
        setNewComment("");
        setIsSubmitting(false);
    };

    const handleEdit = (comment) => {
        setEditingCommentId(comment._id);
        setEditText(comment.commentBody);
    };

    const handleUpdateComment = async () => {
        if (!editText.trim()) return;
        try {
            const response = await axiosInstance.put(`/comment/${editingCommentId}`, {
                commentBody: editText
            });
            if (response.data.comment) {
                setComments((prev) =>
                    prev.map((c) =>
                        c._id === editingCommentId ? { ...c, commentBody: editText } : c
                    )
                );
            }
        } catch (error) {
            console.error(error);
        }
        setEditingCommentId(null);
        setEditText("");
    };

    const handleDelete = async (id) => {
        try {
            await axiosInstance.delete(`/comment/${id}`);
            loadComments();
        } catch (error) {
            console.log(error);
        }
    };

    const react = async (id, action) => {
        try {
            const res = await axiosInstance.post(`/comment/${id}/react`, { action, userId: user?._id });
            if (res.data?.deleted) {
                setComments((prev) => prev.filter((c) => c._id !== id));
            } else if (res.data?.comment) {
                const c = res.data.comment;
                setComments((prev) => prev.map((it) => it._id === id ? c : it));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const translate = async (id) => {
        try {
            const current = comments.find((c) => c._id === id);
            const text = current ? current.commentBody : undefined;
            const targetLang = targetLangById[id] || 'en';
            const res = await axiosInstance.post(`/comment/${id}/translate`, { targetLang, text });
            if (res.data?.translatedText) {
                setTranslated((prev) => ({ ...prev, [id]: res.data.translatedText }));
            } else if (res.data?.message) {
                alert(res.data.message);
            }
        } catch (e) {
            console.error(e);
            const serverMsg = e?.response?.data?.message;
            alert(serverMsg || 'Translation failed. Please try again later.');
        }
    };

    return (
        <div>
            <h2 className='font-bold text-xl'>{comments.length} Comments</h2>
            {user && (
                <div className="flex gap-4">
                    <Avatar className="w-10 h-10">
                        <AvatarImage src={user.image || ""} className='rounded-full' />
                        <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                        <Textarea
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="min-h-[80px] resize-none border-0 border-b-2 rounded-none focus-visible:ring-0"
                        />
                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="secondary"
                                onClick={() => setNewComment("")}
                                disabled={!newComment.trim()}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmitComment}
                                disabled={!newComment.trim() || isSubmitting}
                                className="bg-black text-white">
                                Comment
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            <div className="space-y-4">
                {comments.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">
                        No comments yet. Be the first to comment!
                    </p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment._id} className="flex gap-3">
                            <Avatar className="w-10 h-10 bg-gray-200 flex justify-center items-center rounded-full">
                                <AvatarFallback>{comment.userCommented[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm">
                                        {comment.userCommented}
                                    </span>
                                    {comment.city && (
                                        <span className="text-xs text-gray-600">• {comment.city}</span>
                                    )}
                                    <span className="text-xs text-gray-600">
                                        {comment.commentedOn
                                            ? `${formatDistanceToNow(new Date(comment.commentedOn))} ago`
                                            : "just now"}
                                    </span>
                                </div>

                                {editingCommentId === comment._id ? (
                                    <div className="space-y-2">
                                        <Textarea
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                        />
                                        <div className="flex gap-2 justify-end">
                                            <Button
                                                onClick={handleUpdateComment}
                                                disabled={!editText.trim()}
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                onClick={() => {
                                                    setEditingCommentId(null);
                                                    setEditText("");
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-sm">{translated[comment._id] || comment?.commentBody}</p>
                                        <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                                            <button onClick={() => react(comment._id, 'like')} className="hover:cursor-pointer">👍 {comment.likes || 0}</button>
                                            <button onClick={() => react(comment._id, 'dislike')} className="hover:cursor-pointer">👎 {comment.dislikes || 0}</button>
                                            <select value={targetLangById[comment._id] || 'en'} onChange={(e) => setTargetLangById((prev) => ({ ...prev, [comment._id]: e.target.value }))} className="border rounded px-1 py-0.5 text-xs">
                                                <option value="en">English</option>
                                                <option value="hi">Hindi</option>
                                                <option value="es">Spanish</option>
                                                <option value="fr">French</option>
                                                <option value="de">German</option>
                                            </select>
                                            <button onClick={() => translate(comment._id)} className='underline hover:cursor-pointer'>Translate</button>
                                        </div>
                                        {comment.userId === user?._id && (
                                            <div className="flex gap-2 mt-2 text-sm text-gray-500">
                                                <button onClick={() => handleEdit(comment)} className='hover:cursor-pointer'>
                                                    Edit
                                                </button>
                                                <button onClick={() => handleDelete(comment._id)} className='hover:cursor-pointer'>
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default Comments
