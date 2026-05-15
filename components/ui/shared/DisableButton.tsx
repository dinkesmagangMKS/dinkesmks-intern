import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DisabledButtonProps {
  label: string;
  reason: string;
}

export default function DisabledButton({ label, reason }: DisabledButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-full">
            <Button disabled className="w-full bg-slate-100 text-slate-400 border-none cursor-not-allowed">
              {label}
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-slate-800 text-white">
          <p>{reason}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}