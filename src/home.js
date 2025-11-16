import React from 'react';
import './home.css';

const Home = () => {
  return (
    <div className="home-container">
      <h1>Bem-vindo ao Sistema de Questionários</h1>
      <div className="home-message">
        <p>Selecione um questionário no menu lateral para começar.</p>
      </div>
      <div className="home-message">
        <p>Encontrou algum problema? Por gentileza, entre em contato pelo <b>unasptech.ht@unasp.edu.br</b></p>
      </div>
    </div>
  );
};

export default Home;