import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateAvatarColor } from "@/lib/avatar-utils";

interface NotificationPopupProps {
  isVisible: boolean;
  onClose: () => void;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  message: string;
  onReply?: (message: string) => void;
}

export const NotificationPopup = ({
  isVisible,
  onClose,
  sender,
  message,
  onReply
}: NotificationPopupProps) => {
  const [replyText, setReplyText] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);

  const handleSendReply = () => {
    if (replyText.trim() && onReply) {
      onReply(replyText);
      setReplyText("");
      setShowReplyInput(false);
      onClose();
    }
  };

  const avatarColor = generateAvatarColor(sender.id);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 120 }}
          className="fixed bottom-4 right-4 z-50 w-80"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-card border border-white/20 shadow-2xl backdrop-blur-md bg-white/10 animate-enter">
              {/* Header */}
              <div className="flex items-start justify-between p-4 pb-2">
                <div className="flex items-center space-x-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                  >
                    <div className="relative">
                      <Avatar className="w-10 h-10 ring-2 ring-white/20">
                        {sender.avatar && (
                          <AvatarImage src={sender.avatar} alt={`${sender.name}'s avatar`} />
                        )}
                        <AvatarFallback 
                          className="text-white font-semibold"
                          style={{ backgroundColor: avatarColor }}
                        >
                          {sender.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary pulse" />
                    </div>
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">
                      {sender.name}
                    </h3>
                    <p className="text-xs text-white/70">New message</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white/60 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Message */}
              <div className="px-4 pb-3">
                <p className="text-sm text-white/90 line-clamp-2">
                  {message}
                </p>
              </div>

              {/* Actions */}
              <div className="p-4 pt-0">
                <AnimatePresence>
                  {!showReplyInput ? (
                    <motion.div
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex space-x-2"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowReplyInput(true)}
                        className="flex-1 text-white border-white/20 hover:bg-white/10"
                      >
                        Reply
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="text-white/60 hover:text-white hover:bg-white/10"
                      >
                        Dismiss
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex space-x-2"
                    >
                      <Input
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type a reply..."
                        className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={handleSendReply}
                        disabled={!replyText.trim()}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};