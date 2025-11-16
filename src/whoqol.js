import React, { useState, useEffect } from 'react';
import './whoqol.css';
import { useNavigate } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';

const WHOQOL = () => {
  const [perguntas, setPerguntas] = useState([]);
  const [respostas, setRespostas] = useState({});
  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [gruposRespostas, setGruposRespostas] = useState({});
  const [pontuacao, setPontuacao] = useState([]);
  const navigate = useNavigate();
  const { setHasUnsavedChanges } = useOutletContext();

  useEffect(() => {
    setHasUnsavedChanges(Object.keys(respostas).length > 0);
  }, [respostas, setHasUnsavedChanges]);

  useEffect(() => {
    // Carregar perguntas
    fetch('/perguntas_WHOQOL.txt')
      .then((response) => response.text())
      .then((text) => {
        const perguntasArray = text
          .split('\n')
          .filter((line) => line.trim() !== '')
          .map((line) => line.trim());
        setPerguntas(perguntasArray);
      });

    // Carregar grupos de respostas
    fetch('/grupos_respostas.txt')
      .then((response) => response.text())
      .then((text) => {
        const grupos = {};
        const lines = text.split('\n').filter(line => line.trim() !== '' && !line.startsWith('#'));
        
        lines.forEach(line => {
          if (line.includes(':')) {
            const [grupo, valores] = line.split(':');
            grupos[grupo.trim()] = valores.split(';').map(v => v.trim());
          } else if (line.includes(';')) {
            const pontuacoes = line.split(';').map(v => parseInt(v.trim()));
            setPontuacao(pontuacoes);
          }
        });
        
        setGruposRespostas(grupos);
      });
  }, []);

  const getGrupoPergunta = (index) => {
    const grupo = 
      index === 0 ? 'grupo1' :
      index === 1 ? 'grupo2' :
      index >= 2 && index <= 8 ? 'grupo3' :
      index >= 9 && index <= 13 ? 'grupo4' :
      index === 14 ? 'grupo5' :
      index >= 15 && index <= 24 ? 'grupo6' :
      index === 25 ? 'grupo7' : 'grupo1';
    
    return grupo;
  };

  const handleRespostaChange = (perguntaIndex, valor) => {
    setRespostas({
      ...respostas,
      [perguntaIndex]: {
        valor: valor,
        grupo: getGrupoPergunta(perguntaIndex)
      }
    });
  };

  const handleProximaPergunta = () => {
    const nextPage = perguntaAtual + 5;
    
    if (nextPage < perguntas.length) {
      setPerguntaAtual(nextPage);
    } else {
      console.log('Última página alcançada - não há mais páginas');
    }
  };
  
  const handlePerguntaAnterior = () => {
    const prevPage = Math.max(0, perguntaAtual - 5);
    setPerguntaAtual(prevPage);
  };

  const calcularPontuacaoWHOQOL = () => {
    const total = Object.values(respostas).reduce((total, resposta) => total + resposta.valor, 0);
    return total;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    if (Object.keys(respostas).length !== perguntas.length) {
      alert('Por favor, responda todas as perguntas antes de enviar.');
      return;
    }
  
    const pontuacaoTotal = calcularPontuacaoWHOQOL();
  
    setHasUnsavedChanges(false);
  
    navigate('/resultado', {
      state: {
        formulario: 'WHOQOL',
        pontuacao: pontuacaoTotal
      }
    });
  };  

  if (perguntas.length === 0 || Object.keys(gruposRespostas).length === 0) {
    return <div className="carregando">Carregando perguntas...</div>;
  }

  const indiceFinal = Math.min(perguntaAtual + 5, perguntas.length);
  const perguntasNaPagina = perguntas.slice(perguntaAtual, indiceFinal);

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="form">
        <div className="form-header">
          <h2 className="form-title">Qualidade de Vida</h2>
          <h4>WHOQOL-BREF</h4>
        </div>
        
        <div className="perguntas-wrapper">
          {perguntasNaPagina.map((pergunta, index) => {
            const currentIndex = perguntaAtual + index;
            const grupo = getGrupoPergunta(currentIndex);
            const opcoes = gruposRespostas[grupo] || [];
            const textoPergunta = pergunta.replace(/^\d+\.\s*/, '').trim();

            return (
              <div key={currentIndex} className="perguntaContainer">
                <label className="perguntaLabel">
                  {currentIndex + 1}. {textoPergunta}
                </label>
                <div className="opcoesContainer">
                  {opcoes.map((opcao, i) => (
                    <label key={i} className="opcaoLabel">
                      <input
                        type="radio"
                        name={`pergunta-${currentIndex}`}
                        value={pontuacao[i]}
                        checked={respostas[currentIndex]?.valor === pontuacao[i]}
                        onChange={() => handleRespostaChange(currentIndex, pontuacao[i])}
                        className="opcaoInput"
                      />
                      <span>{opcao} ({pontuacao[i]})</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
  
        <div className="form-buttons">
          <button
            type="button"
            onClick={handlePerguntaAnterior}
            disabled={perguntaAtual === 0}
            className="form-button button-back"
          >
            {perguntaAtual === 0 ? 'Início' : 'Voltar (5 perguntas)'}
          </button>
          
          {perguntaAtual + 5 < perguntas.length ? (
            <button
              type="button"
              onClick={handleProximaPergunta}
              className="form-button button-next"
            >
              Avançar (5 perguntas)
            </button>
          ) : (
            <button 
                type="submit" 
                className="form-button button-submit"
                disabled={
                    perguntas.length === 0 ||
                    Object.keys(respostas).length === 0 ||
                    Object.keys(respostas).length !== perguntas.length
                }
                >
                Enviar Respostas
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default WHOQOL;