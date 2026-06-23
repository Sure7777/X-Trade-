import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { client } from '@/lib/client';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await client.auth.login();
        navigate('/');
      } catch {
        navigate('/');
      }
    };
    handleCallback();
  }, []);

  return (
    <div className="min-h-screen gradient-navy flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-success border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground font-cairo">جاري تسجيل الدخول...</p>
      </div>
    </div>
  );
}