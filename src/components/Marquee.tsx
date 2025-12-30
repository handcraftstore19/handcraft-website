import { Award, TrendingUp } from "lucide-react";

const Marquee = () => {
  const marqueeContent = (
    <div className="flex items-center gap-8 px-4">
      <Award className="h-4 w-4 text-primary flex-shrink-0" />
      <span className="text-sm font-medium text-foreground whitespace-nowrap">
        Crafting Excellence Since 1989 • Top Sellers • Premium Quality
      </span>
      <TrendingUp className="h-4 w-4 text-primary flex-shrink-0" />
    </div>
  );

  return (
    <div className="bg-primary/10 border-b border-primary/20 py-2 overflow-hidden relative">
      <div className="flex animate-marquee whitespace-nowrap">
        {marqueeContent}
        {marqueeContent}
        {marqueeContent}
        {marqueeContent}
      </div>
      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-25%);
          }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
          display: flex;
        }
      `}</style>
    </div>
  );
};

export default Marquee;

