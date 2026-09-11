import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Stock Management is the same as Inventory — redirect to avoid duplicate navigation
export default function StockManagement() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/inventory', { replace: true }); }, [navigate]);
  return null;
}
