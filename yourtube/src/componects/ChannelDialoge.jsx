import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogHeader } from "./UI/dialog";
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import { Label } from "@radix-ui/react-label";
import { Input } from "./UI/Input";
import { Textarea } from "./UI/textarea";
import { Button } from "./UI/Button2";
import axiosInstance from "../lib/axiosInstance.js"
import { useUser } from "../lib/AuthContext.jsx";

const ChannelDialoge = ({ isOpen, onClose, channeldata, mode }) => {
    // const user = {
    //     id: "1",
    //     name: "Pankaj Chaudhary",
    //     email: "pankaj@gmail.com",
    //     image: "Shample Profile Image.jpg"
    // };
    const { user, login } = useUser();
    const [formData, setFormData] = useState({ name: "", description: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (mode === "edit" && channeldata) {
            setFormData({
                name: channeldata.name || "",
                description: channeldata.description || ""
            });
        } else {
            setFormData({
                name: user?.channelName || "",
                description: ""
            });
        }
    }, [channeldata, mode, user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault(); // ✅ fixed typo
        setIsSubmitting(true);
        // perform API call or save logic here
        console.log("Submitted data:", formData);

        const payload = {
            channelname: formData.name,
            description: formData.description
        };
        const respose = await axiosInstance.patch(`/user/update/${user._id}`, payload);
        login(respose?.data);
        navigate(`/channel/${user.id}`);
        console.log("respose", respose);
        setFormData({
            name: channeldata.name || "",
            description: channeldata.description || ""
        });
        setTimeout(() => {
            setIsSubmitting(false);
            onClose(); // close after save
        }, 1000);
    };
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md md:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "create" ? "Create your channel" : "Edit your channel"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Channel Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Channel Name</Label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>
                    {/* Channel Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Channel Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Tell viewers about your channel..."
                        />
                    </div>

                    <DialogFooter className="flex justify-between sm:justify-between">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting
                                ? "Saving..."
                                : mode === "create"
                                    ? "Create Channel"
                                    : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default ChannelDialoge
