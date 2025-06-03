
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, ArrowDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useGroupChat } from "@/hooks/privateGroups/useGroupChat";

interface GroupChatProps {
  groupId: string;
}

const GroupChat = ({ groupId }: GroupChatProps) => {
  const { messages, loading, sending, sendMessage } = useGroupChat(groupId);
  const [newMessage, setNewMessage] = useState("");
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

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
    
    await sendMessage(newMessage);
    setNewMessage("");
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const isNewDay = (currentMsg: any, prevMsg: any) => {
    if (!prevMsg) return true;
    
    const currentDate = new Date(currentMsg.created_at).toDateString();
    const prevDate = new Date(prevMsg.created_at).toDateString();
    
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
                  const isCurrentUser = msg.user_id === user?.id;
                  const showDateDivider = isNewDay(msg, messages[index - 1]);
                  
                  return (
                    <div key={msg.id}>
                      {showDateDivider && (
                        <div className="flex justify-center my-4">
                          <span className="bg-muted px-2 py-1 rounded-full text-xs text-muted-foreground">
                            {formatDate(msg.created_at)}
                          </span>
                        </div>
                      )}
                      
                      <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
                        {!isCurrentUser && (
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback className="text-xs">
                              {(msg.userName || 'U').split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div>
                          {!isCurrentUser && (
                            <div className="text-xs text-muted-foreground mb-1">
                              {msg.userName || 'Unknown User'}
                            </div>
                          )}
                          
                          <div className={`
                            px-4 py-2 rounded-lg max-w-md break-words
                            ${isCurrentUser 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-foreground'}
                          `}>
                            {msg.message}
                            <div className={`text-xs mt-1 ${isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                              {formatTime(msg.created_at)}
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
