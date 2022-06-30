import { useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { api } from '../services/api';

export const Dashboard = () => {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    api.get('/me').then((response) => {
      console.log(response.data);
    });
  }, []);

  return <h1>Dashboard: {user?.email}</h1>;
};

export default Dashboard;
