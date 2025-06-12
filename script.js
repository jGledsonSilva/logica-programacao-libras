document.addEventListener('DOMContentLoaded', function () {
    let lessons = {};
    let currentLessonId = null;
    let selectedAnswerIndex = null; // NOVO: Guarda a resposta selecionada pelo usuário

    // Seletores de elementos da página (adicionando os da atividade)
    const secaoBoasVindas = document.getElementById('boas-vindas');
    const telaCarregamento = document.getElementById('tela-carregamento');
    const mainDashboard = document.getElementById('main-dashboard');
    const inputNome = document.getElementById('inputNome');
    const btnIniciarCurso = document.getElementById('btnIniciarCurso');

    const dashboardColunaEsquerda = document.querySelector('.dashboard-coluna-esquerda');
    const dashboardColunaDireita = document.querySelector('.dashboard-coluna-direita');
    const dashboardNomeUsuarioEl = document.getElementById('dashboardNomeUsuario');
    const dashboardProgressoAtual = document.getElementById('dashboardProgressoAtual');
    const dashboardProgressoValor = document.getElementById('dashboardProgressoValor');
    const btnDashboardReiniciar = document.getElementById('btnDashboardReiniciar');
    const btnDashboardSair = document.getElementById('btnDashboardSair');

    const lessonView = document.getElementById('lesson-view');
    const lessonViewTopicNumber = document.getElementById('lessonViewTopicNumber');
    const lessonViewTopicTitle = document.getElementById('lessonViewTopicTitle');
    const lessonViewExplanationText = document.getElementById('lessonViewExplanationText');
    const lessonViewActivityQuestion = document.getElementById('lessonViewActivityQuestion'); // NOVO
    const lessonViewActivityOptions = document.getElementById('lessonViewActivityOptions'); // NOVO
    const btnVerificarAtividade = document.getElementById('btnVerificarAtividade'); // NOVO
    const lessonViewActivityFeedback = document.getElementById('lessonViewActivityFeedback'); // NOVO
    const btnVoltarDashboard = document.getElementById('btnVoltarDashboard');

    const modalParabens = document.getElementById('modalParabens');
    const fecharModalParabens = document.getElementById('fecharModalParabens');
    const nomeUsuarioModal = document.getElementById('nomeUsuarioModal');

    const modalOverlay = document.getElementById('modalOverlay');
    const modalMessage = document.getElementById('modalMessage');
    const modalBtnConfirm = document.getElementById('modalBtnConfirm');
    const modalBtnCancel = document.getElementById('modalBtnCancel');
    let modalConfirmCallback = null;

    const lessonOrder = ['algoritmos', 'sequencia', 'condicionais', 'repeticoes', 'eventos'];

    // --- FUNÇÕES PRINCIPAIS ---

    async function loadLessons() {
        try {
            const response = await fetch('lessons.json');
            lessons = await response.json();
            // Transforma o array em um objeto para acesso fácil por ID
            lessons = lessons.reduce((acc, lesson) => {
                acc[lesson.id] = lesson;
                return acc;
            }, {});
            updateDashboard();
        } catch (error) {
            console.error("Erro ao carregar as lições:", error);
            showModal("Erro ao carregar o conteúdo das lições. Tente recarregar a página.");
        }
    }

    function showModal(message, showCancelButton = false, onConfirm = null) {
        if (!modalOverlay || !modalMessage || !modalBtnConfirm || !modalBtnCancel) { return; }
        modalMessage.textContent = message;
        modalBtnCancel.style.display = showCancelButton ? 'inline-block' : 'none';
        modalOverlay.style.display = 'flex';
        modalConfirmCallback = onConfirm;
    }

    function updateDashboard() {
        if (!dashboardColunaEsquerda || !lessons || Object.keys(lessons).length === 0) { return; }
        dashboardColunaEsquerda.innerHTML = '';
        dashboardColunaDireita.innerHTML = '';

        const nomeUsuario = localStorage.getItem('nomeUsuario');
        if (dashboardNomeUsuarioEl && nomeUsuario) {
            dashboardNomeUsuarioEl.textContent = nomeUsuario.toUpperCase();
        }

        let lessonsCompletedCount = 0;
        lessonOrder.forEach((lessonId, index) => {
            const lesson = lessons[lessonId];
            if (!lesson) return;
            const card = createLessonCard(lessonId, index + 1, lesson.title);
            const isCompleted = localStorage.getItem(`${lessonId}Completed`) === 'true';
            if (isCompleted) {
                card.classList.add('concluido');
                lessonsCompletedCount++;
            }
            card.addEventListener('click', () => showLesson(lessonId));
            dashboardColunaEsquerda.appendChild(card);
        });

        const challengeCard = createLessonCard('desafio_final', '★', lessons.desafio_final.title);
        challengeCard.classList.add('desafio');
        const allPrerequisitesCompleted = lessonOrder.every(id => localStorage.getItem(`${id}Completed`) === 'true');
        if (!allPrerequisitesCompleted) {
            challengeCard.classList.add('bloqueado');
            challengeCard.title = "Complete todas as lições para desbloquear";
        } else {
            challengeCard.addEventListener('click', () => showLesson('desafio_final'));
        }
        if (localStorage.getItem('desafio_finalCompleted') === 'true') {
            challengeCard.classList.add('concluido');
        }
        dashboardColunaDireita.appendChild(challengeCard);

        const vlibrasPlaceholder = document.createElement('div');
        vlibrasPlaceholder.id = 'vlibras-placeholder';
        vlibrasPlaceholder.innerHTML = 'Área para<br>VLibras';
        dashboardColunaDireita.appendChild(vlibrasPlaceholder);

        const totalLessons = lessonOrder.length;
        const progressPercentage = totalLessons > 0 ? (lessonsCompletedCount / totalLessons) * 100 : 0;
        if (dashboardProgressoAtual) dashboardProgressoAtual.style.width = `${progressPercentage}%`;
        if (dashboardProgressoValor) dashboardProgressoValor.textContent = `${Math.round(progressPercentage)}%`;
    }

    function createLessonCard(id, number, title) {
        const card = document.createElement('div');
        card.className = 'dashboard-lesson-card';
        card.dataset.lessonId = id;
        const numberSpan = document.createElement('span');
        numberSpan.className = 'lesson-number';
        numberSpan.textContent = number;
        const titleSpan = document.createElement('span');
        titleSpan.className = 'lesson-title-text';
        titleSpan.textContent = title;
        card.appendChild(numberSpan);
        card.appendChild(titleSpan);
        return card;
    }

    function showDashboard() {
        secaoBoasVindas.style.display = 'none';
        mainDashboard.style.display = 'flex';
        lessonView.style.display = 'none';
        updateDashboard();
    }

    // ALTERADO: Função showLesson agora monta a atividade prática
    function showLesson(lessonId) {
        const lesson = lessons[lessonId];
        if (!lesson) { return; }
        currentLessonId = lessonId;
        mainDashboard.style.display = 'none';
        lessonView.style.display = 'flex';

        lessonViewTopicNumber.textContent = lesson.number || '★';
        lessonViewTopicTitle.textContent = lesson.title || 'Tópico';

        if (lesson.content && Array.isArray(lesson.content)) {
            lessonViewExplanationText.innerHTML = lesson.content.map(p => p.startsWith('<pre') ? p : `<p>${p}</p>`).join('');
        } else {
            lessonViewExplanationText.innerHTML = '<p>Explicação não disponível.</p>';
        }

        // --- LÓGICA DA ATIVIDADE ---
        const activity = lesson.activity;
        if (activity) {
            lessonViewActivityQuestion.innerHTML = activity.question;
            lessonViewActivityOptions.innerHTML = ''; // Limpa opções anteriores
            lessonViewActivityFeedback.innerHTML = ''; // Limpa feedback anterior
            selectedAnswerIndex = null; // Reseta a resposta selecionada

            activity.options.forEach((optionText, index) => {
                const optionButton = document.createElement('button');
                optionButton.className = 'activity-option-button';
                optionButton.innerHTML = optionText;
                optionButton.addEventListener('click', () => {
                    // Remove a seleção de outros botões
                    document.querySelectorAll('.activity-option-button').forEach(btn => btn.classList.remove('selected'));
                    // Adiciona a classe 'selected' ao botão clicado
                    optionButton.classList.add('selected');
                    selectedAnswerIndex = index;
                });
                lessonViewActivityOptions.appendChild(optionButton);
            });
        }

        const isCompleted = localStorage.getItem(`${lessonId}Completed`) === 'true';
        btnVerificarAtividade.disabled = isCompleted;
    }

    // NOVO: Função para verificar a resposta da atividade
    function checkAnswer() {
        const lesson = lessons[currentLessonId];
        if (selectedAnswerIndex === null) {
            showModal("Por favor, selecione uma resposta.");
            return;
        }

        if (selectedAnswerIndex === lesson.activity.correctAnswer) {
            lessonViewActivityFeedback.textContent = "Parabéns, resposta correta!";
            lessonViewActivityFeedback.className = 'activity-feedback-text correct';
            localStorage.setItem(`${currentLessonId}Completed`, 'true');
            btnVerificarAtividade.disabled = true;
            checkFinalCompletion();
        } else {
            lessonViewActivityFeedback.textContent = "Resposta incorreta. Tente novamente!";
            lessonViewActivityFeedback.className = 'activity-feedback-text incorrect';
        }
    }

    function checkFinalCompletion() {
        const allLessonsDone = lessonOrder.every(id => localStorage.getItem(`${id}Completed`) === 'true');
        const challengeDone = localStorage.getItem('desafio_finalCompleted') === 'true';

        if (allLessonsDone && challengeDone) {
            const nomeUsuario = localStorage.getItem('nomeUsuario');
            if (nomeUsuarioModal) nomeUsuarioModal.textContent = nomeUsuario;
            if (modalParabens) modalParabens.style.display = 'flex';
        }
    }

    // --- EVENT LISTENERS ---

    if (btnIniciarCurso) {
        btnIniciarCurso.addEventListener('click', () => {
            const nome = inputNome.value.trim();
            if (nome) {
                localStorage.setItem('nomeUsuario', nome);
                secaoBoasVindas.style.display = 'none';
                telaCarregamento.style.display = 'flex';
                loadLessons().then(() => {
                    setTimeout(() => {
                        telaCarregamento.style.display = 'none';
                        showDashboard();
                    }, 500);
                });
            } else {
                showModal("Por favor, digite seu nome para continuar.");
            }
        });
    }

    if (btnVerificarAtividade) {
        btnVerificarAtividade.addEventListener('click', checkAnswer); // NOVO
    }

    if (btnVoltarDashboard) {
        btnVoltarDashboard.addEventListener('click', showDashboard);
    }

    if (fecharModalParabens) {
        fecharModalParabens.addEventListener('click', () => {
            modalParabens.style.display = 'none';
        });
    }

    if (modalBtnConfirm) {
        modalBtnConfirm.addEventListener('click', () => {
            modalOverlay.style.display = 'none';
            if (modalConfirmCallback) {
                modalConfirmCallback();
                modalConfirmCallback = null;
            }
        });
    }

    if (modalBtnCancel) { // Adicionado para garantir que o botão de cancelar também feche o modal
        modalBtnCancel.addEventListener('click', () => {
            modalOverlay.style.display = 'none';
            modalConfirmCallback = null; // Limpa o callback de confirmação
        });
    }

    if (btnDashboardReiniciar) {
        btnDashboardReiniciar.addEventListener('click', () => {
            showModal(
                "Tem certeza de que deseja reiniciar todo o seu progresso? Esta ação não pode ser desfeita.",
                true, // Mostrar botão de cancelar
                () => {
                    const nomeUsuario = localStorage.getItem('nomeUsuario');
                    localStorage.clear(); // Limpa tudo
                    if (nomeUsuario) {
                        localStorage.setItem('nomeUsuario', nomeUsuario); // Restaura apenas o nome
                    }
                    updateDashboard(); // Atualiza o dashboard para refletir o progresso zerado
                    showDashboard(); // Garante que o dashboard seja exibido
                    showModal("Seu progresso foi reiniciado!");
                }
            );
        });
    }

    if (btnDashboardSair) {
        btnDashboardSair.addEventListener('click', () => {
            showModal(
                "Tem certeza de que deseja sair e apagar todos os seus dados? Você perderá todo o seu progresso e seu nome será esquecido.",
                true, // Mostrar botão de cancelar
                () => {
                    localStorage.clear(); // Limpa tudo, incluindo o nome do usuário
                    // Esconde todas as seções principais e mostra a de boas-vindas
                    if (mainDashboard) mainDashboard.style.display = 'none';
                    if (lessonView) lessonView.style.display = 'none';
                    if (telaCarregamento) telaCarregamento.style.display = 'none';
                    if (secaoBoasVindas) secaoBoasVindas.style.display = 'flex';
                    if (inputNome) inputNome.value = ''; // Limpa o campo do nome
                }
            );
        });
    }

    // --- INICIALIZAÇÃO ---

    const nomeSalvo = localStorage.getItem('nomeUsuario');
    if (nomeSalvo) {
        inputNome.value = nomeSalvo;
        telaCarregamento.style.display = 'flex';
        loadLessons().then(() => {
            setTimeout(() => {
                telaCarregamento.style.display = 'none';
                showDashboard();
            }, 500);
        });
    } else {
        secaoBoasVindas.style.display = 'flex';
    }
});