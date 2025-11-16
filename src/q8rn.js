import React, { useState, useEffect } from 'react';
import './whoqol.css';
import { useNavigate } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';

const Q8RN = () => {
  const [perguntas, setPerguntas] = useState([]);
  const [respostas, setRespostas] = useState({});
  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [gruposRespostas, setGruposRespostas] = useState({});
  const [pontuacao, setPontuacao] = useState([]);
  const [mapeamentoGrupos, setMapeamentoGrupos] = useState({});
  const navigate = useNavigate();
  const { setHasUnsavedChanges } = useOutletContext();

  useEffect(() => {
    setHasUnsavedChanges(Object.keys(respostas).length > 0);
  }, [respostas, setHasUnsavedChanges]);

  useEffect(() => {
    // Carregar perguntas
    fetch('/perguntas_Q8RN.txt')
      .then((response) => response.text())
      .then((text) => {
        const perguntasArray = text
          .split('\n')
          .filter((line) => line.trim() !== '')
          .map((line) => line.trim());
        console.log('Perguntas Q8RN carregadas:', perguntasArray.length, perguntasArray);
        setPerguntas(perguntasArray);
      });

    // Carregar grupos de respostas
    fetch('/grupos_respostas_Q8RN.txt')
      .then((response) => response.text())
      .then((text) => {
        const grupos = {};
        const mapeamento = {};
        const lines = text.split('\n').filter(line => line.trim() !== '' && !line.startsWith('#'));

        lines.forEach(line => {
          if (line.includes(':')) {
            const splitIndex = line.indexOf(':');
            const grupo = line.slice(0, splitIndex).trim();
            const valores = line.slice(splitIndex + 1).trim();
            if (grupo.match(/^\d+$/)) {
              mapeamento[grupo.trim()] = valores.trim();
              console.log(`Mapeamento: pergunta ${grupo.trim()} → grupo ${valores.trim()}`);
            } else {
              grupos[grupo.trim()] = valores.split(';').map(v => v.trim());
              console.log(`Grupo de respostas carregado: ${grupo.trim()}`, valores.split(';').map(v => v.trim()));
            }
          } else if (line.includes(';')) {
            const pontuacoes = line.split(';').map(v => parseInt(v.trim()));
            console.log('Pontuações Q8RN carregadas:', pontuacoes);
            setPontuacao(pontuacoes);
          }
        });

        setGruposRespostas(grupos);
        setMapeamentoGrupos(mapeamento);
      });
  }, []);

  const getGrupoPergunta = (index) => {
    const grupo = mapeamentoGrupos[index + 1] || 'grupo1';
    console.log(`Pergunta Q8RN ${index} pertence ao grupo:`, grupo);
    return grupo;
  };

  const handleProximaPergunta = () => {
    const nextPage = perguntaAtual + 5;
    console.log('Q8RN - Tentando ir para próxima página:', {
      páginaAtual: perguntaAtual,
      próximaPágina: nextPage,
      totalPerguntas: perguntas.length
    });
    
    if (nextPage < perguntas.length) {
      console.log('Q8RN - Indo para próxima página:', nextPage);
      setPerguntaAtual(nextPage);
    } else {
      console.log('Q8RN - Última página alcançada - não há mais páginas');
    }
  };
  
  const handlePerguntaAnterior = () => {
    const prevPage = Math.max(0, perguntaAtual - 5);
    console.log('Q8RN - Voltando para página anterior:', prevPage);
    setPerguntaAtual(prevPage);
  };

  const handleRespostaChange = (perguntaIndex, valor) => {
    console.log(`Q8RN - Resposta alterada - Pergunta ${perguntaIndex}:`, valor);
    setRespostas({
      ...respostas,
      [perguntaIndex]: {
        valor: valor,
        grupo: getGrupoPergunta(perguntaIndex)
      }
    });
    setHasUnsavedChanges(true);
  };

  const calcularPontuacaoQ8RN = () => {
    const total = Object.values(respostas).reduce((total, resposta) => {
      // Perguntas dicotômicas (11-14) valem 0 ou 4
      if ([10,11,12,13].includes(Number(resposta.grupo.replace('grupo', '')))) {
        return total + (resposta.valor === 0 ? 0 : 4);
      }
      return total + resposta.valor;
    }, 0);
    console.log('Q8RN - Calculando pontuação total:', total);
    return total;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    if (Object.keys(respostas).length !== perguntas.length) {
      alert('Por favor, responda todas as perguntas antes de enviar.');
      return;
    }
  
    const pontuacaoTotal = calcularPontuacaoQ8RN();
  
    setHasUnsavedChanges(false);
  
    navigate('/resultado', {
      state: {
        formulario: 'Q8RN', 
        pontuacao: pontuacaoTotal
      }
    });
  };
  
  if (perguntas.length === 0 || Object.keys(gruposRespostas).length === 0) {
    console.log('Q8RN - Carregando perguntas ou grupos de respostas...');
    return <div className="carregando">Carregando perguntas Q8RN...</div>;
  }

  const indiceFinal = Math.min(perguntaAtual + 5, perguntas.length);
  const perguntasNaPagina = perguntas.slice(perguntaAtual, indiceFinal);

  console.log('Q8RN - Renderizando página:', {
    páginaAtual: perguntaAtual,
    indiceFinal,
    perguntasNaPagina: perguntasNaPagina.length,
    totalPerguntas: perguntas.length,
    mostrarBotãoEnviar: perguntaAtual + 5 >= perguntas.length
  });

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="form">
        <div className="form-header">
            <h2 className="form-title">Estilo de Vida</h2>
            <h4>Q8RN</h4>
        </div>
        <div className="perguntas-wrapper">
          {perguntasNaPagina.map((pergunta, index) => {
            const currentIndex = perguntaAtual + index;
            const grupo = getGrupoPergunta(currentIndex);
            const opcoes = gruposRespostas[grupo] || [];
            const textoPergunta = pergunta.replace(/^\d+\.\s*/, '').trim();
            
            console.log(`Q8RN - Renderizando pergunta ${currentIndex}:`, {
              grupo,
              opcoes: opcoes.length,
              respostaAtual: respostas[currentIndex]?.valor,
              tipoInput: grupo === 'grupo5' ? 'checkbox' : 'radio'
            });

            return (
              <div key={currentIndex} className="perguntaContainer">
                <label className="perguntaLabel">
                  {currentIndex + 1}. {textoPergunta}
                </label>
                <div className="opcoesContainer">
                  {opcoes.map((opcao, i) => (
                    <label key={i} className="opcaoLabel">
                      <input
                        type={grupo === 'grupo5' ? 'checkbox' : 'radio'}
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

export default Q8RN;