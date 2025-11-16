import { useLocation, useNavigate } from 'react-router-dom';
import './resultado.css';

const Resultado = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state?.formulario || !state?.pontuacao) {
    return <div className="container">Dados inválidos</div>;
  }

  const { formulario, pontuacao } = state;

  const classificarQ8RN = (pontos) => {
    const ranges = [
      { min: 74, label: 'Excelente', class: 'excelente' },
      { min: 59, label: 'Muito Bom', class: 'muito-bom' },
      { min: 45, label: 'Bom', class: 'bom' },
      { min: 26, label: 'Regular', class: 'regular' },
      { min: 0, label: 'Insuficiente', class: 'insuficiente' }
    ];
    return ranges.find(r => pontos >= r.min);
  };

  const handleRecomecar = () => {
    navigate(formulario === 'Q8RN' ? '/q8rn' : '/whoqol', { replace: true });
  };

  return (
    <div className="container">
      <div className="resultado-form">
        <h2 className="resultado-titulo">Resultados do {formulario}</h2>
        
        <div className="resultado-pontuacao">
          <h3>Pontuação Total:</h3>
          <div className="pontuacao-valor">{pontuacao}</div>
          
          {formulario === 'Q8RN' && (
            <div className="resultado-classificacao">
              <h4>Sua classificação:</h4>
              <div className={`classificacao ${classificarQ8RN(pontuacao).class}`}>
                {classificarQ8RN(pontuacao).label}
              </div>
            </div>
          )}
        </div>

        <button 
          className="botao-recomecar"
          onClick={handleRecomecar}
        >
          ↻ Recomeçar Questionário
        </button>
      </div>
    </div>
  );
};

export default Resultado;