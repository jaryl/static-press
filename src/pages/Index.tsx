
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login on the index page
    navigate('/login');
  }, [navigate]);

  // This component won't actually render anything as it redirects immediately
  return null;
};

export default Index;
