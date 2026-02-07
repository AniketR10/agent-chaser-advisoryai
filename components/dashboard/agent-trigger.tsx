'use client'

import { Button } from "@/components/ui/button";
import { triggerAgent } from "@/app/actions";
import { Bot, Sparkles } from "lucide-react";
import { useState } from "react";

export function AgentTrigger() {
  const [loading, setLoading] = useState(false);

  const handleTrigger = async () => {
    setLoading(true);
    await triggerAgent();
    setLoading(false);
  };

  return (
    <Button 
      onClick={handleTrigger} 
      disabled={loading}
      className="bg-indigo-600 hover:bg-indigo-700 text-white"
    >
      {loading ? (
        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Bot className="w-4 h-4 mr-2" />
      )}
      Run Agent Cycle
    </Button>
  );
}