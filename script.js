document.addEventListener('DOMContentLoaded', function () {
    let lessons = {};
    let currentLessonId = null;
    const apiKey = "YOUR_GEMINI_API_KEY";

    const secaoBoasVindas = document.getElementById('boas-vindas');
    const telaCarregamento = document.getElementById('tela-carregamento');
    const mainDashboard = document.getElementById('main-dashboard');
    const inputNome = document.getElementById('inputNome');
    const btnIniciarCurso = document.getElementById('btnIniciarCurso');

    const dashboardColunaEsquerda = document.querySelector('.dashboard-coluna-esquerda');
    const dashboardColunaDireita = document.querySelector('.dashboard-coluna-direita');
    const dashboardNomeUsuarioEl = document.getElementById('dashboardNomeUsuario');
    const dashboardProgressoAtual = document.getElementById('dashboardProgressoAtual');
    const btnDashboardReiniciar = document.getElementById('btnDashboardReiniciar');
    const btnDashboardSair = document.getElementById('btnDashboardSair');

    const lessonView = document.getElementById('lesson-view');
    const lessonViewTopicNumber = document.getElementById('lessonViewTopicNumber');
    const lessonViewTopicTitle = document.getElementById('lessonViewTopicTitle');
    const lessonViewExplanationText = document.getElementById('lessonViewExplanationText');
    const lessonViewExerciseText = document.getElementById('lessonViewExerciseText');
    const lessonViewVlibrasVideo = document.getElementById('lessonViewVlibrasVideo');
    const btnVoltarDashboard = document.getElementById('btnVoltarDashboard');

    const challengeView = document.getElementById('challenge-view');
    const challengeFeedback = document.getElementById('challenge-feedback');
    const draggableItemsContainer = document.getElementById('draggable-items');
    const dropzone = document.getElementById('dropzone');
    const checkChallengeBtn = document.getElementById('check-challenge-btn');
    const backToDashboardFromChallengeBtn = document.getElementById('back-to-dashboard-from-challenge-btn');

    const modalOverlay = document.getElementById('modalOverlay');
    const modalMessage = document.getElementById('modalMessage');
    const modalBtnConfirm = document.getElementById('modalBtnConfirm');
    const modalBtnCancel = document.getElementById('modalBtnCancel');
    let modalConfirmCallback = null;

    async function loadLessons() {
        try {
            const response = await fetch('lessons.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const lessonsData = await response.json();
            lessons = lessonsData.reduce((acc, lesson) => {
                acc[lesson.id] = lesson;
                return acc;
            }, {});
            updateDashboard();
        } catch (error) {
            console.error("Erro ao carregar as lições:", error);
            if (dashboardColunaEsquerda) {
                dashboardColunaEsquerda.innerHTML = "<p style='color:red; text-align:center;'>Erro ao carregar o conteúdo das lições. Tente recarregar a página.</p>";
            }
        }
    }

    const lessonOrder = ['algoritmos', 'sequencia', 'condicionais', 'repeticoes', 'eventos'];

    function showModal(message, showCancelButton = false, onConfirm = null) {
        if (!modalOverlay || !modalMessage || !modalBtnConfirm || !modalBtnCancel) {
            console.error("Elementos do modal não encontrados. Usando alert() como fallback.");
            if (confirm(message)) {
                if (onConfirm) onConfirm();
            }
            return;
        }

        modalMessage.textContent = message;
        modalBtnCancel.style.display = showCancelButton ? 'inline-block' : 'none';
        modalOverlay.style.display = 'flex';

        modalConfirmCallback = onConfirm;
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

    if (modalBtnCancel) {
        modalBtnCancel.addEventListener('click', () => {
            modalOverlay.style.display = 'none';
            modalConfirmCallback = null;
        });
    }

    function updateDashboard() {
        if (!dashboardColunaEsquerda || !dashboardColunaDireita || !lessons || Object.keys(lessons).length === 0) {
            return;
        }
        dashboardColunaEsquerda.innerHTML = '';
        dashboardColunaDireita.innerHTML = '';

        const nomeUsuario = localStorage.getItem('nomeUsuario');
        if (dashboardNomeUsuarioEl && nomeUsuario) {
            dashboardNomeUsuarioEl.textContent = nomeUsuario.toUpperCase();
            if (nomeUsuario.length > 8) {
                dashboardNomeUsuarioEl.style.transform = 'translate(-50%, -50%)';
            } else {
                dashboardNomeUsuarioEl.style.transform = 'translate(-50%, -50%) rotate(6.4deg)';
            }
        }

        let lessonsCompletedCount = 0;

        lessonOrder.forEach((lessonId, index) => {
            const lesson = lessons[lessonId];
            if (!lesson) return;

            const card = document.createElement('div');
            card.classList.add('dashboard-lesson-card');
            card.dataset.lessonId = lessonId;

            const numberSpan = document.createElement('span');
            numberSpan.classList.add('lesson-number');
            numberSpan.textContent = index + 1;

            const titleSpan = document.createElement('span');
            titleSpan.classList.add('lesson-title-text');
            titleSpan.textContent = lesson.title.split(':')[1]?.trim() || lesson.title;

            card.appendChild(numberSpan);
            card.appendChild(titleSpan);

            const isCompleted = localStorage.getItem(`${lessonId}Completed`) === 'true';
            if (isCompleted) {
                card.classList.add('concluido');
                lessonsCompletedCount++;
            }

            card.addEventListener('click', () => showLesson(lessonId));
            dashboardColunaEsquerda.appendChild(card);
        });

        const challengeCard = document.createElement('div');
        challengeCard.classList.add('dashboard-lesson-card', 'desafio');
        challengeCard.dataset.lessonId = 'desafioFinal';

        const challengeNumberSpan = document.createElement('span');
        challengeNumberSpan.classList.add('lesson-number');
        challengeNumberSpan.textContent = lessonOrder.length + 1;

        const challengeTitleSpan = document.createElement('span');
        challengeTitleSpan.classList.add('lesson-title-text');
        challengeTitleSpan.textContent = "Desafio Final";

        challengeCard.appendChild(challengeNumberSpan);
        challengeCard.appendChild(challengeTitleSpan);

        const allPrerequisitesCompleted = lessonOrder.every(id => localStorage.getItem(`${id}Completed`) === 'true');

        if (allPrerequisitesCompleted) {
            challengeCard.classList.remove('locked');
            challengeCard.addEventListener('click', showChallenge);
        } else {
            challengeCard.classList.add('locked');
            challengeCard.title = "Complete todas as lições para desbloquear";
        }
        dashboardColunaDireita.appendChild(challengeCard);

        const vlibrasPlaceholder = document.createElement('div');
        vlibrasPlaceholder.id = 'vlibras-placeholder';
        vlibrasPlaceholder.textContent = 'VLIBRAS';
        dashboardColunaDireita.appendChild(vlibrasPlaceholder);

        const totalLessons = lessonOrder.length;
        const progressPercentage = totalLessons > 0 ? (lessonsCompletedCount / totalLessons) * 100 : 0;
        if (dashboardProgressoAtual) {
            dashboardProgressoAtual.style.width = `${progressPercentage}%`;
        }
    }

    function showDashboard() {
        secaoBoasVindas.style.display = 'none';
        telaCarregamento.style.display = 'none';
        mainDashboard.style.display = 'flex';
        lessonView.style.display = 'none';
        challengeView.style.display = 'none';
        updateDashboard();
    }

    function showLesson(lessonId) {
        const lesson = lessons[lessonId];
        if (!lesson) {
            console.error("Lição não encontrada:", lessonId);
            return;
        }
        currentLessonId = lessonId;
        mainDashboard.style.display = 'none';
        lessonView.style.display = 'flex';
        challengeView.style.display = 'none';

        if (lessonViewTopicNumber) lessonViewTopicNumber.textContent = lesson.number || '';
        if (lessonViewTopicTitle) lessonViewTopicTitle.textContent = lesson.title.split(':')[1]?.trim() || lesson.title;
        if (lessonViewExplanationText) lessonViewExplanationText.innerHTML = lesson.text || 'Explicação não disponível.';
        if (lessonViewExerciseText) lessonViewExerciseText.innerHTML = lesson.exercise || 'Exercício não disponível.';
        if (lessonViewVlibrasVideo) {
            lessonViewVlibrasVideo.innerHTML = lesson.media || '<p>Conteúdo VLibras não disponível.</p>';
        }

        const isCompleted = localStorage.getItem(`${lessonId}Completed`) === 'true';
    }

    function showChallenge() {
        const allPrerequisitesCompleted = lessonOrder.every(id => localStorage.getItem(`${id}Completed`) === 'true');
        if (!allPrerequisitesCompleted) {
            showModal("Você precisa completar todas as lições antes de iniciar o desafio final!");
            return;
        }
        mainDashboard.style.display = 'none';
        lessonView.style.display = 'none';
        challengeView.style.display = 'block';
        setupChallengeItems();
        if (challengeFeedback) challengeFeedback.innerHTML = '';
    }

    function completeLesson() {
        if (currentLessonId) {
            localStorage.setItem(`${currentLessonId}Completed`, 'true');
            updateDashboard();
            const allLessonsDone = lessonOrder.every(id => localStorage.getItem(`${id}Completed`) === 'true');
            if (allLessonsDone) {
                console.log("Todas as lições concluídas! Desafio final desbloqueado.");
            }
        }
    }

    if (btnIniciarCurso) {
        btnIniciarCurso.addEventListener('click', () => {
            const nome = inputNome.value.trim();
            if (nome) {
                localStorage.setItem('nomeUsuario', nome);
                secaoBoasVindas.style.display = 'none';
                telaCarregamento.style.display = 'flex';

                loadLessons().then(() => {
                    showDashboard();
                }).catch(error => {
                    console.error("Erro ao carregar lições após inserir nome:", error);
                    if (telaCarregamento) {
                        telaCarregamento.innerHTML = '<p style="color:red; text-align:center;">Erro ao carregar os dados do curso.<br>Tente recarregar a página.</p>';
                    }
                    showModal("Erro ao carregar os dados do curso. Tente recarregar a página.");
                });
            } else {
                showModal("Por favor, digite seu nome para continuar.");
            }
        });
    }

    if (btnDashboardReiniciar) {
        btnDashboardReiniciar.addEventListener('click', () => {
            showModal("Tem certeza que deseja reiniciar todo o seu progresso?", true, () => {
                lessonOrder.forEach(id => {
                    localStorage.removeItem(`${id}Completed`);
                });
                localStorage.removeItem('challengeCompleted');
                updateDashboard();
                showModal("Progresso reiniciado!");
            });
        });
    }

    if (btnDashboardSair) {
        btnDashboardSair.addEventListener('click', () => {
            showModal("Tem certeza que deseja sair? Seu nome e progresso serão apagados.", true, () => {
                localStorage.clear();
                secaoBoasVindas.style.display = 'flex';
                mainDashboard.style.display = 'none';
                lessonView.style.display = 'none';
                challengeView.style.display = 'none';
                if (inputNome) inputNome.value = '';
            });
        });
    }

    if (btnVoltarDashboard) {
        btnVoltarDashboard.addEventListener('click', showDashboard);
    }
    if (backToDashboardFromChallengeBtn) {
        backToDashboardFromChallengeBtn.addEventListener('click', showDashboard);
    }

    async function callGemini(prompt, event) {
        if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY") {
            console.warn("API Key do Gemini não configurada.");
            return "API Key não configurada. Verifique o arquivo script.js.";
        }
        const loadingElement = document.createElement('p');
        loadingElement.classList.add('loading');
        loadingElement.textContent = 'Gerando com IA...';

        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 1,
                        topP: 1,
                        maxOutputTokens: 256,
                    },
                }),
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error("Erro na API Gemini:", response.status, errorBody);
                throw new Error(`Erro da API: ${response.status}`);
            }

            const data = await response.json();
            if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
                return data.candidates[0].content.parts[0].text;
            } else {
                console.warn("Resposta da API Gemini não contém o texto esperado:", data);
                return "Não foi possível obter uma resposta da IA no momento.";
            }
        } catch (error) {
            console.error("Erro ao chamar a API Gemini:", error);
            return "Falha ao comunicar com a IA. Verifique o console para mais detalhes.";
        }
    }

    let draggedItem = null;
    const correctOrder = ["passo1", "passo2", "passo3", "passo4"];

    function setupChallengeItems() {
        if (!draggableItemsContainer || !dropzone) return;

        draggableItemsContainer.innerHTML = '';
        dropzone.innerHTML = '<p>Arraste os passos para cá na ordem correta!</p>';

        const items = [
            { id: "passo1", text: "1. Pegar o copo" },
            { id: "passo3", text: "3. Beber a água" },
            { id: "passo2", text: "2. Encher o copo com água" },
            { id: "passo4", text: "4. Colocar o copo na pia" }
        ];

        items.sort(() => Math.random() - 0.5);

        items.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('draggable');
            div.textContent = item.text;
            div.setAttribute('draggable', true);
            div.id = item.id;
            div.addEventListener('dragstart', dragStart);
            draggableItemsContainer.appendChild(div);
        });
    }

    function dragStart(e) {
        draggedItem = e.target;
    }

    if (dropzone) {
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('dragover');
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            if (draggedItem) {
                const existingItem = dropzone.querySelector(`#${draggedItem.id}`);
                if (!existingItem) {
                    if (dropzone.firstChild && dropzone.firstChild.nodeType === Node.TEXT_NODE && dropzone.firstChild.textContent.includes("Arraste os passos")) {
                        dropzone.innerHTML = '';
                    }
                    dropzone.appendChild(draggedItem);
                    draggedItem = null;
                }
            }
        });
    }

    if (checkChallengeBtn) {
        checkChallengeBtn.addEventListener('click', () => {
            if (!dropzone || !challengeFeedback) return;

            const itemsInDropzone = Array.from(dropzone.querySelectorAll('.draggable')).map(item => item.id);

            if (itemsInDropzone.length !== correctOrder.length) {
                challengeFeedback.textContent = "Por favor, coloque todos os passos na área de resposta.";
                challengeFeedback.className = 'feedback error';
                return;
            }

            const isCorrect = JSON.stringify(itemsInDropzone) === JSON.stringify(correctOrder);

            if (isCorrect) {
                challengeFeedback.textContent = "Parabéns! Você ordenou corretamente!";
                challengeFeedback.className = 'feedback success';
                localStorage.setItem('challengeCompleted', 'true');
                checkChallengeBtn.disabled = true;
            } else {
                challengeFeedback.textContent = "Ordem incorreta. Tente novamente!";
                challengeFeedback.className = 'feedback error';
            }
        });
    }

    const nomeSalvo = localStorage.getItem('nomeUsuario');
    if (nomeSalvo) {
        if (telaCarregamento) telaCarregamento.style.display = 'flex';
        loadLessons().then(() => {
            showDashboard();
        }).catch(error => {
            console.error("Erro ao carregar lições na inicialização:", error);
            if (telaCarregamento) {
                telaCarregamento.innerHTML = '<p style="color:red; text-align:center;">Erro ao carregar. Tente recarregar.</p>';
            }
            showModal("Erro ao carregar os dados. Tente recarregar a página.");
        });
    } else {
        if (secaoBoasVindas) secaoBoasVindas.style.display = 'flex';
    }
});
