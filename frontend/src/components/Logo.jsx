import { useNavigate } from 'react-router-dom';

export default function Logo() {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate('/')}
      className="cursor-pointer group flex flex-col items-start transition-all duration-300 hover:scale-105"
    >
      <div className="text-3xl font-bold tracking-tight">
        <span className="text-slate-900">Doc</span>
        <span className="text-blue-700">Ease</span>
      </div>
      <p className="text-slate-500 text-xs font-medium tracking-wide mt-1 group-hover:text-slate-600 transition-colors">
        Learning from documentation made easy
      </p>
    </div>
  );
}
