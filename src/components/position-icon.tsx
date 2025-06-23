import type { LucideProps } from 'lucide-react';
import { Target, Users, Shield, HandMetal } from 'lucide-react';
import type { Position } from '@/lib/types';

export const PositionIcon = ({ position, ...props }: { position: Position } & LucideProps) => {
  switch (position) {
    case 'Forward':
      return <Target {...props} />;
    case 'Midfielder':
      return <Users {...props} />;
    case 'Defender':
      return <Shield {...props} />;
    case 'Goalkeeper':
      return <HandMetal {...props} />;
    default:
      return null;
  }
};
