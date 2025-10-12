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

    const handleSubmitComment = async () => {
        if (!user || !newComment.trim()) return;
        const response = await axiosInstance.post(`/comment/${videoId}`, {
            userId: user?._id,
            commentBody: newComment,
            userCommented: user.name || "Anonymous",
        });
        if (response.data.comment) {
            setIsSubmitting(true);
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
                                        <p className="text-sm">{comment?.commentBody}</p>
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
