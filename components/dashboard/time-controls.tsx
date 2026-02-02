'use client'

import { Button } from "@/components/ui/button";
import { advanceTime } from "@/app/actions";
import { CalendarClock, FastForward } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// export function TimeControls() {
//   const [isPending, setIsPending] = useState(false);

//   const handleAdvance = async (days: number) => {
//     setIsPending(true);
//     await advanceTime(days);
//     setIsPending(false);
//   };

//   return (
//     <div className="flex items-center gap-2">
//       <Button 
//         variant="secondary" 
//         size="sm"
//         className="cursor-pointer hover:bg-amber-200"
//         disabled={isPending}
//         onClick={() => handleAdvance(1)}
//       >
//         <CalendarClock className="w-4 h-4 mr-2" />
//         +1 Day
//       </Button>
      
//       <Button 
//         variant="secondary" 
//         size="sm"
//         className="cursor-pointer hover:bg-amber-200"
//         disabled={isPending}
//         onClick={() => handleAdvance(7)}
//       >
//         <FastForward className="w-4 h-4 mr-2" />
//         +1 Week
//       </Button>
//     </div>
//   );
// }