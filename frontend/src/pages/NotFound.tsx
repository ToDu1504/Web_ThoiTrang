import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="font-display text-8xl font-semibold text-foreground/10"
      >
        404
      </motion.p>
      <h1 className="font-display -mt-6 text-2xl font-semibold text-foreground">Không tìm thấy trang</h1>
      <p className="mt-2 text-sm text-muted-foreground">Trang bạn yêu cầu không tồn tại hoặc đã được di chuyển.</p>
      <Button asChild className="mt-6">
        <Link to="/">Về trang chủ</Link>
      </Button>
    </div>
  );
}
