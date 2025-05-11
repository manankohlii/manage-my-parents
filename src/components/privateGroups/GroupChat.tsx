
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Send, ArrowDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

interface Message {
  id: string;
  text: string;
  userId: string;
  userName: string;
  timestamp: string;
}

interface GroupChatProps {
  groupId: string;
}

// Mock chat messages
const mockMessages: Message[] = [
  {
    id: "msg1",
    text: "Hey everyone, welcome to our new group!",
    userId: "user1",
    userName: "Sarah Johnson",
    timestamp: "2025-05-10T10:00:00"
  },
  {
    id: "msg2",
    text: "Thanks for creating this, Sarah! I'm excited to collaborate.",
    userId: "user2",
    userName: "Michael Chen",
    timestamp: "2025-05-10T10:02:00"
  },
  {
    id: "msg3",
    text: "I've been thinking about some ideas for our next project. Would love to discuss them here.",
    userId: "user3",
    userName: "Emma Wilson",
    timestamp: "2025-05-10T10:05:00"
  },
  {
    id: "msg4",
    text: "That sounds great, Emma! Let's set up a time to discuss those ideas.",
    userId: "user1",
    userName: "Sarah Johnson",
    timestamp: "2025-05-10T10:10:00"
  }
];

const GroupChat = ({ groupId }: GroupChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    // Simulate loading chat messages
    const loadMessages = async () => {
      try {
        // Would fetch from Supabase in a real implementation
        await new Promise(resolve => setTimeout(resolve, 800));
        setMessages(mockMessages);
      } catch (error) {
        toast({
          title: "Failed to load messages",
          description: "Could not load chat messages. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadMessages();
  }, [groupId, toast]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setSending(true);
    
    try {
      // Simulate sending a message - would use Supabase in a real implementation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create new message object
      const newMsg: Message = {
        id: `msg-${Date.now()}`,
        text: newMessage.trim(),
        userId: user?.id || 'current-user',
        userName: user?.email?.split('@')[0] || 'You',
        timestamp: new Date().toISOString()
      };
      
      // Add message to chat
      setMessages([...messages, newMsg]);
      setNewMessage("");
      
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "Your message could not be sent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const isNewDay = (currentMsg: Message, prevMsg: Message | undefined) => {
    if (!prevMsg) return true;
    
    const currentDate = new Date(currentMsg.timestamp).toDateString();
    const prevDate = new Date(prevMsg.timestamp).toDateString();
    
    return currentDate !== prevDate;
  };

  return (
    <div className="flex flex-col h-[60vh]">
      <Card className="flex-1 overflow-hidden">
        <CardContent className="p-0 flex flex-col h-full">
          <div 
            ref={chatContainerRef} 
            className="flex-1 overflow-y-auto p-4 space-y-4"
            onScroll={handleScroll}
          >
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? '' : 'justify-end'} mb-4`}>
                  {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full mr-2" />}
                  <div className={`space-y-2 ${i % 2 === 0 ? '' : 'items-end'}`}>
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-16 w-60 rounded-lg" />
                  </div>
                  {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full ml-2" />}
                </div>
              ))
            ) : (
              <>
                {messages.map((msg, index) => {
                  const isCurrentUser = msg.userId === user?.id || msg.userId === 'current-user';
                  const showDateDivider = isNewDay(msg, messages[index - 1]);
                  
                  return (
                    <div key={msg.id}>
                      {showDateDivider && (
                        <div className="flex justify-center my-4">
                          <span className="bg-muted px-2 py-1 rounded-full text-xs text-muted-foreground">
                            {formatDate(msg.timestamp)}
                          </span>
                        </div>
                      )}
                      
                      <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
                        {!isCurrentUser && (
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback className="text-xs">
                              {msg.userName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div>
                          {!isCurrentUser && (
                            <div className="text-xs text-muted-foreground mb-1">
                              {msg.userName}
                            </div>
                          )}
                          
                          <div className={`
                            px-4 py-2 rounded-lg max-w-md break-words
                            ${isCurrentUser 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-foreground'}
                          `}>
                            {msg.text}
                            <div className={`text-xs mt-1 ${isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                              {formatTime(msg.timestamp)}
                            </div>
                          </div>
                        </div>
                        
                        {isCurrentUser && (
                          <Avatar className="h-8 w-8 ml-2">
                            <AvatarFallback className="text-xs">You</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
          
          {showScrollButton && (
            <Button 
              size="sm"
              variant="outline" 
              className="absolute bottom-16 right-4 rounded-full p-2"
              onClick={scrollToBottom}
            >
              <ArrowDown size={16} />
            </Button>
          )}
          
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="min-h-[60px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={sending}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={sending || !newMessage.trim()}
                className="self-end"
              >
                <Send size={16} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupChat;
