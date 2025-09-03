import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Check, Send, MessageSquare, UserPlus, Package, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNotificationsContext } from "@/hooks/useNotifications";

const getNotificationIcon = (type: string) => {
	switch (type) {
		case 'match': return UserPlus;
		case 'message': return MessageSquare;
		case 'deal': return Package;
		case 'system': return Zap;
		default: return Bell;
	}
};

const getNotificationColor = (type: string) => {
	switch (type) {
		case 'match': return 'from-green-500 to-green-600';
		case 'message': return 'from-blue-500 to-blue-600';
		case 'deal': return 'from-purple-500 to-purple-600';
		case 'system': return 'from-orange-500 to-orange-600';
		default: return 'from-gray-500 to-gray-600';
	}
};

const formatTimestamp = (d: Date) => {
	try {
		const diff = Date.now() - d.getTime();
		const mins = Math.floor(diff / 60000);
		if (mins < 1) return 'just now';
		if (mins < 60) return `${mins}m ago`;
		const hrs = Math.floor(mins / 60);
		if (hrs < 24) return `${hrs}h ago`;
		const days = Math.floor(hrs / 24);
		return `${days}d ago`;
	} catch {
		return '';
	}
};

const NotificationPanel = () => {
	const [isOpen, setIsOpen] = useState(false);
	const panelRef = useRef<HTMLDivElement>(null);
	const { notifications, markAsRead, markAllAsRead, removeNotification, sendReply } = useNotificationsContext();
	const [replyingId, setReplyingId] = useState<string | null>(null);
	const [replyText, setReplyText] = useState<string>("");

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
				setIsOpen(false);
				setReplyingId(null);
				setReplyText("");
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const unreadNotifications = notifications.filter(n => !n.isRead);
	const hasUnread = unreadNotifications.length > 0;

	const handleStartReply = (e: React.MouseEvent, id: string) => {
		e.stopPropagation();
		setReplyingId(id);
		setReplyText("");
	};

	const handleSend = async (e: React.MouseEvent | KeyboardEvent, id: string) => {
		e.stopPropagation?.();
		const notif = notifications.find(n => n.id === id);
		if (!notif || !replyText.trim()) return;
		await sendReply(notif, replyText.trim());
		setReplyText("");
		setReplyingId(null);
	};

	const handleCancel = (e: React.MouseEvent) => {
		e.stopPropagation();
		setReplyText("");
		setReplyingId(null);
	};

	return (
		<div className="relative" ref={panelRef}>
			<motion.button
				onClick={() => setIsOpen(!isOpen)}
				className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
			>
				<Bell className="w-5 h-5" />
				<AnimatePresence>
					{hasUnread && (
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							exit={{ scale: 0 }}
							className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center"
						>
							<motion.div
								animate={{ scale: [1, 1.2, 1] }}
								transition={{ duration: 2, repeat: Infinity }}
								className="w-2 h-2 bg-red-500 rounded-full"
							/>
						</motion.div>
					)}
				</AnimatePresence>
			</motion.button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: -10, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -10, scale: 0.95 }}
						transition={{ duration: 0.2 }}
						className="absolute right-0 top-full mt-2 w-96 z-50"
					>
						<Card className="glass-card border border-border/20 shadow-xl">
							<div className="p-4 border-b border-border/20">
								<div className="flex items-center justify-between">
									<h3 className="font-semibold text-foreground">Notifications</h3>
									<div className="flex items-center space-x-2">
										{hasUnread && (
											<Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
												Mark all read
											</Button>
										)}
										<Badge variant="secondary" className="text-xs">{unreadNotifications.length}</Badge>
									</div>
								</div>
							</div>
							<CardContent className="p-0 max-h-96 overflow-y-auto 
              [&::-webkit-scrollbar]:hidden 
              [-ms-overflow-style:'none'] 
              [scrollbar-width:'none']">
								{notifications.length === 0 ? (
									<div className="p-8 text-center">
										<Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
										<p className="text-muted-foreground">No notifications yet</p>
									</div>
								) : (
									<div className="space-y-1">
										{notifications.map((n, index) => {
											const Icon = getNotificationIcon(n.type);
											const isReplying = replyingId === n.id;
											return (
												<motion.div
													key={n.id}
													initial={{ opacity: 0, x: -20 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ delay: index * 0.05 }}
													className={`p-4 border-b border-border/10 hover:bg-muted/20 transition-colors group ${!n.isRead ? 'bg-primary/5' : ''}`}
													onClick={() => markAsRead(n.id)}
												>
													<div className="flex items-start space-x-3">
														<motion.div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getNotificationColor(n.type)} flex items-center justify-center flex-shrink-0`} whileHover={{ scale: 1.1 }}>
															<Icon className="w-5 h-5 text-white" />
														</motion.div>
														<div className="flex-1 min-w-0">
															<div className="flex items-start justify-between">
																<div className="flex-1">
																	<h4 className={`text-sm font-medium ${!n.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>{n.type === 'message' ? `New message from ${n.senderName}` : n.type}</h4>
																	<p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.message}</p>
																	<div className="flex items-center justify-between mt-2">
																		<span className="text-xs text-muted-foreground">{formatTimestamp(n.timestamp)}</span>
																		{!isReplying ? (
																			<motion.button className="text-xs text-primary font-medium cursor-pointer" whileHover={{ scale: 1.05 }} onClick={(e) => handleStartReply(e, n.id)}>Reply</motion.button>
																		) : null}
																	</div>
																	{isReplying ? (
																		<div className="mt-3 flex items-center space-x-2">
																			<Input value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type a reply..." className="flex-1" onKeyDown={(e) => { if (e.key === 'Enter') handleSend(e as any, n.id); }} autoFocus />
																			<Button size="sm" onClick={(e) => handleSend(e, n.id)} disabled={!replyText.trim()}>
																				<Send className="w-4 h-4" />
																			</Button>
																			<Button size="sm" variant="ghost" onClick={handleCancel}>Cancel</Button>
																		</div>
																	) : null}
															</div>
															<div className="flex items-center space-x-1 ml-2">
																{!n.isRead && (
																	<motion.button onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }} className="p-1 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity" whileHover={{ scale: 1.2 }} title="Mark as read">
																		<Check className="w-3 h-3" />
																	</motion.button>
																)}
																<motion.button onClick={(e) => { e.stopPropagation(); removeNotification(n.id); }} className="p-1 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" whileHover={{ scale: 1.2 }} title="Dismiss">
																	<X className="w-3 h-3" />
																</motion.button>
														</div>
														</div>
														</div>
													</div>
												</motion.div>
											);
										})}
									</div>
								)}
							</CardContent>
						</Card>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default NotificationPanel;