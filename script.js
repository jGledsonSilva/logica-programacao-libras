document.addEventListener('DOMContentLoaded', function () {
    const inputNome = document.getElementById('inputNome');
    const btnIniciarCurso = document.getElementById('btnIniciarCurso');
    const secaoBoasVindas = document.getElementById('boas-vindas');
    const telaCarregamento = document.getElementById('tela-carregamento');
    const headerPrincipal = document.getElementById('header-principal');
    const mainDashboard = document.getElementById('main-dashboard');
    const footerPrincipal = document.getElementById('footer-principal');
    const mensagemBoasVindasUsuario = document.getElementById('mensagemBoasVindasUsuario');
    const modalParabens = document.getElementById('modalParabens');
    const fecharModalParabens = document.getElementById('fecharModalParabens');
    const nomeUsuarioModal = document.getElementById('nomeUsuarioModal');

    // Elementos da Topbar
    const topbar = document.getElementById('topbar');
    const topbarNomeUsuario = document.getElementById('topbarNomeUsuario');
    const btnSair = document.getElementById('btnSair');
    const btnReiniciar = document.getElementById('btnReiniciar');

    if (btnIniciarCurso) {
        btnIniciarCurso.addEventListener('click', function () {
            const nomeUsuario = inputNome.value.trim();
            if (nomeUsuario) {
                localStorage.setItem('nomeUsuario', nomeUsuario);
                localStorage.setItem('progresso', '0');
                atualizarProgresso();

                secaoBoasVindas.style.display = 'none';
                telaCarregamento.style.display = 'flex';

                setTimeout(function () {
                    telaCarregamento.style.display = 'none';
                    if (topbar) topbar.style.display = 'flex'; // Mostra a topbar
                    if (headerPrincipal) headerPrincipal.style.display = 'block';
                    if (mainDashboard) mainDashboard.style.display = 'block';
                    if (footerPrincipal) footerPrincipal.style.display = 'block';

                    carregarDadosUsuario(); // Carrega nome e atualiza topbar e mensagem de boas-vindas
                    // atualizarProgresso(); // Já chamado antes de mostrar o dashboard
                }, 2000);
            } else {
                alert('Por favor, digite seu nome.');
            }
        });
    }

    if (btnSair) {
        btnSair.addEventListener('click', function () {
            localStorage.removeItem('nomeUsuario');
            localStorage.removeItem('progresso');
            // Ocultar todas as seções do dashboard e a topbar
            if (topbar) topbar.style.display = 'none';
            if (headerPrincipal) headerPrincipal.style.display = 'none';
            if (mainDashboard) mainDashboard.style.display = 'none';
            if (footerPrincipal) footerPrincipal.style.display = 'none';
            if (modalParabens) modalParabens.style.display = 'none';
            // Mostrar seção de boas-vindas
            if (secaoBoasVindas) secaoBoasVindas.style.display = 'flex';
            // Opcional: recarregar a página para um reset completo do estado da UI
            // window.location.reload(); 
        });
    }

    if (btnReiniciar) {
        btnReiniciar.addEventListener('click', function () {
            localStorage.setItem('progresso', '0');
            atualizarProgresso();
            if (modalParabens) {
                modalParabens.style.display = 'none'; // Esconde o modal se estiver aberto
            }
            // Poderia adicionar uma mensagem "Progresso reiniciado!"
            alert("Seu progresso foi reiniciado!");
        });
    }

    function exibirModalParabens() {
        const nomeSalvo = localStorage.getItem('nomeUsuario');
        if (nomeUsuarioModal && nomeSalvo) {
            nomeUsuarioModal.textContent = nomeSalvo;
        }
        if (modalParabens) {
            modalParabens.style.display = 'flex';
        }
    }

    if (fecharModalParabens) {
        fecharModalParabens.addEventListener('click', function () {
            if (modalParabens) {
                modalParabens.style.display = 'none';
            }
        });
    }

    // Fechar o modal se clicar fora do conteúdo
    window.addEventListener('click', function (event) {
        if (event.target == modalParabens) {
            modalParabens.style.display = "none";
        }
    });

    // Função para carregar dados do usuário (nome, progresso)
    function carregarDadosUsuario() {
        const nomeSalvo = localStorage.getItem('nomeUsuario');
        if (nomeSalvo) {
            if (mensagemBoasVindasUsuario && mainDashboard.style.display === 'block') {
                mensagemBoasVindasUsuario.textContent = `Olá, ${nomeSalvo}! Sou o [Nome], pronto para mais aprendizado?`;
            }
            if (topbarNomeUsuario) {
                topbarNomeUsuario.textContent = `Usuário: ${nomeSalvo}`;
            }
        }
    }


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
                verificarConclusaoTotal(); // Verifica se deve exibir o modal
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

        if (progresso < 0) progresso = 0; // Garante que não seja negativo
        if (progresso > 100) progresso = 100; // Garante que não passe de 100

        if (progressoAtualDiv) {
            progressoAtualDiv.style.width = progresso + '%';
        }
        if (progressoValorDiv) {
            progressoValorDiv.textContent = progresso + '%';
        }
        // Não chama verificarConclusaoTotal() aqui para não exibir o modal a cada atualização simples,
        // apenas quando uma ação específica de conclusão ocorre.
    }

    function verificarConclusaoTotal() {
        let progresso = parseInt(localStorage.getItem('progresso') || '0', 10);
        if (progresso === 100) {
            exibirModalParabens();
        }
    }

    // Lógica de inicialização da página
    const nomeSalvo = localStorage.getItem('nomeUsuario');
    if (!nomeSalvo) {
        // Se não há nome, garante que a tela de boas-vindas seja mostrada
        if (topbar) topbar.style.display = 'none';
        if (secaoBoasVindas) secaoBoasVindas.style.display = 'flex';
        if (telaCarregamento) telaCarregamento.style.display = 'none';
        if (headerPrincipal) headerPrincipal.style.display = 'none';
        if (mainDashboard) mainDashboard.style.display = 'none';
        if (footerPrincipal) footerPrincipal.style.display = 'none';
        if (modalParabens) modalParabens.style.display = 'none';
    } else {
        // Se tem nome, o usuário já passou pela tela de boas-vindas.
        // Mostra o dashboard diretamente.
        if (topbar) topbar.style.display = 'flex'; // Mostra a topbar
        if (secaoBoasVindas) secaoBoasVindas.style.display = 'none';
        if (telaCarregamento) telaCarregamento.style.display = 'none';
        if (headerPrincipal) headerPrincipal.style.display = 'block';
        if (mainDashboard) mainDashboard.style.display = 'block';
        if (footerPrincipal) footerPrincipal.style.display = 'block';
        if (modalParabens) modalParabens.style.display = 'none';
        carregarDadosUsuario();
        atualizarProgresso();
        verificarConclusaoTotal();
    }

});
