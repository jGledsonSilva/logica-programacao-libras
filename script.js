document.addEventListener('DOMContentLoaded', function () {
    // Lógica para index.html (Dashboard)
    const btnExemplo = document.getElementById('btnExemplo');
    if (btnExemplo) {
        btnExemplo.addEventListener('click', function () {
            localStorage.setItem('progresso', '33'); // Exemplo: 33% ao clicar em exemplo
            atualizarProgresso();
            window.location.href = 'exemplo.html';
        });
    }

    const btnDesafioHome = document.getElementById('btnDesafio'); // Botão de desafio na home
    if (btnDesafioHome) {
        btnDesafioHome.addEventListener('click', function () {
            // Poderia marcar o início do desafio ou manter o progresso de exemplo
            // localStorage.setItem('progresso', '66'); 
            atualizarProgresso();
            window.location.href = 'desafio.html';
        });
    }

    const btnVerConceito = document.querySelector('#caixaIntroducao .btnCaixa');
    const secaoConceitoOriginal = document.getElementById('secao-conceito-original');
    if (btnVerConceito && secaoConceitoOriginal) {
        btnVerConceito.addEventListener('click', function (event) {
            event.preventDefault(); // Previne o comportamento padrão do link se houver href="#"
            secaoConceitoOriginal.style.display = secaoConceitoOriginal.style.display === 'none' ? 'block' : 'none';
            // Atualiza progresso se for a primeira vez vendo o conceito
            if (localStorage.getItem('progresso') < 10) { // Exemplo de condição
                localStorage.setItem('progresso', '10');
            }
            atualizarProgresso();
        });
    }

    // Lógica para exemplo.html
    const btnDesafioExemplo = document.getElementById('btnDesafio'); // Botão de desafio na página de exemplo
    if (btnDesafioExemplo && window.location.pathname.includes('exemplo.html')) { // Garante que é o botão da página de exemplo
        btnDesafioExemplo.addEventListener('click', function () {
            localStorage.setItem('progresso', '66'); // Exemplo: 66% ao ir para o desafio
            atualizarProgresso();
            window.location.href = 'desafio.html';
        });
    }

    // Lógica para desafio.html
    const feedbackDiv = document.getElementById('feedbackArea');
    const opcaoParar = document.getElementById('opcaoParar');
    const opcaoSeguir = document.getElementById('opcaoSeguir');

    if (opcaoParar) {
        opcaoParar.addEventListener('click', function () {
            if (feedbackDiv) {
                feedbackDiv.innerHTML = '<p style="color:green;">Correto! Devemos parar.</p><img src="path/to/sinal_correto.gif" alt="Sinal de Correto em Libras">';
                localStorage.setItem('progresso', '100'); // 100% ao acertar o desafio
                atualizarProgresso();
            }
        });
    }

    if (opcaoSeguir) {
        opcaoSeguir.addEventListener('click', function () {
            if (feedbackDiv) {
                feedbackDiv.innerHTML = '<p style="color:red;">Errado! Tente de novo. É perigoso seguir no vermelho.</p><img src="path/to/sinal_tentar_novamente.gif" alt="Sinal de Tentar Novamente em Libras">';
                // Não altera o progresso em caso de erro, ou pode diminuir se desejar
            }
        });
    }

    // Função para atualizar a barra de progresso
    function atualizarProgresso() {
        const progressoAtualDiv = document.getElementById('progressoAtual');
        const progressoValorDiv = document.getElementById('progressoValor');
        let progresso = localStorage.getItem('progresso') || '0';
        progresso = parseInt(progresso, 10);

        if (progressoAtualDiv) {
            progressoAtualDiv.style.width = progresso + '%';
        }
        if (progressoValorDiv) {
            progressoValorDiv.textContent = progresso + '%';
        }
    }

    // Atualiza o progresso ao carregar qualquer página
    atualizarProgresso();
});
