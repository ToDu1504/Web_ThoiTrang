import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-semibold text-gray-900">404</h1>
      <p className="mt-2 text-gray-500">Không tìm thấy trang bạn yêu cầu.</p>
      <Link to="/" className="mt-4 inline-block text-brand-600 hover:underline">
        Về trang chủ
      </Link>
    </div>
  );
}
