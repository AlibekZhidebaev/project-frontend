    // -- Блок переменных --
    let selectElement = document.getElementById('pageSize');
    let table = document.getElementById("myTable");
    let tbody = table.querySelector("tbody");
    let paginationSection = document.getElementById('pagination-section');
    let currentPage = 0;
    let pageSize = 3;
    let totalAccounts = 3;
    let totalPages = 0;

    getTotalAccounts();
    getPlayers(currentPage, pageSize);

    // -- Функция в виде GET запроса на получение списка игроков --
    function getPlayers(pageNumber, pageSize) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', '/rest/players?pageNumber=' + pageNumber + '&pageSize=' + pageSize, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                let players = JSON.parse(xhr.responseText);
                fillTable(players);
                getTotalAccounts();
                updatePaginationButtons();
                updatePagination(players.length);
            }
        };
        xhr.send();
    }

    // -- Функция в виде GET запроса на получение общего количества игроков --
    function getTotalAccounts() {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', '/rest/players/count', true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                totalAccounts = parseInt(xhr.responseText);
                calculateTotalPages();
            }
        };
        xhr.send();
    }

    // -- Функция в виде DELETE запроса на удаление игрока с указанным id --
    function deleteAccount(playerId) {
        let xhr = new XMLHttpRequest();
        xhr.open('DELETE', '/rest/players/' + playerId, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    console.log('Account with id=' + playerId + ' has been deleted successfully.');
                    // После успешного удаления аккаунта, обновляем список аккаунтов
                    getPlayers(currentPage, pageSize);
                } else {
                    console.error('Error when deleting account with id=' + playerId + '.');
                }
            }
        };
        xhr.send();
    }

    // -- Функция в виде  POST запроса для обновления списка --
    function updateAccount(playerId, updatedPlayerData) {
        let xhr = new XMLHttpRequest();
        xhr.open('POST', '/rest/players/' + playerId, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    console.log('Account with id=' + playerId + ' was successfully updated.');
                    getPlayers(currentPage, pageSize);
                } else {
                    console.error('Error updating account with id=' + playerId + '.');
                }
            }
        };
        xhr.send(JSON.stringify(updatedPlayerData));
    }

    // -- Значения всплывающих списков для атрибутов race, profession и  banned --
    function getDropdownOptions() {
        return {
            raceOptions: ["HUMAN", "DWARF", "ELF", "GIANT", "ORC", "TROLL", "HOBBIT"], // -- Значения для Race --
            professionOptions: ["WARRIOR", "ROGUE", "SORCERER", "CLERIC", "PALADIN", "NAZGUL", "WARLOCK", "DRUID"], // -- Значения для Profession --
            banned: ["true", "false"] // -- Значения для banned --
        };
    }

    // -- Функция для создания выпадающего списка для race, profession и  banned --
    function createDropdownSelect(options, selectedValue) {
        let select = document.createElement('select');
        options.forEach(function (option) {
            let optionElement = document.createElement('option');
            optionElement.textContent = option;
            if (option === selectedValue) {
                optionElement.selected = true;
            }
            select.appendChild(optionElement);
        });
        return select;
    }

    // -- Заполнение таблицы списком игроков --
    function fillTable(players) {
        // Заполнение tbody данными
        tbody.innerHTML = '';  // -- Очистка tbody перед заполнением --
        let dropdownOptions = getDropdownOptions();
        // -- Заполнение tbody данными --
        for (let key in players) {
            let player = players[key];
            let row = tbody.insertRow();
            let idCell = row.insertCell();
            idCell.textContent = player.id;
            let nameCell = row.insertCell();
            nameCell.textContent = player.name;
            let titleCell = row.insertCell();
            titleCell.textContent = player.title;
            let raceCell = row.insertCell();
            raceCell.textContent = player.race;
            let professionCell = row.insertCell();
            professionCell.textContent = player.profession;
            let levelCell = row.insertCell();
            levelCell.textContent = player.level;
            let birthdayCell = row.insertCell();
            let birthdayDate = new Date(player.birthday);
            birthdayCell.textContent = birthdayDate.toISOString().split('T')[0];
            let bannedCell = row.insertCell();
            bannedCell.textContent = player.banned;

            // -- Добавление колонки "Edit" с иконкой редактирования --

            let editCell = row.insertCell();
            let editIconUrl = '/img/edit.png';
            let editIcon = document.createElement('img');
            editIcon.src = editIconUrl;
            editIcon.alt = 'Edit';
            editIcon.addEventListener('click', function () {
                if (editIcon.alt === 'Edit') {
                    // -- При клике на кнопку "Edit" делаем поля редактируемыми --
                    nameCell.innerHTML = '<input type="text" value="' + player.name + '">';
                    titleCell.innerHTML = '<input type="text" value="' + player.title + '">';
                    let raceSelect = createDropdownSelect(dropdownOptions.raceOptions, player.race.toString());
                    raceCell.innerHTML = '';
                    raceCell.appendChild(raceSelect);
                    let professionSelect = createDropdownSelect(dropdownOptions.professionOptions, player.profession.toString());
                    professionCell.innerHTML = '';
                    professionCell.appendChild(professionSelect);
                    let bannedSelect = createDropdownSelect(dropdownOptions.banned, player.banned.toString());
                    bannedCell.innerHTML = '';
                    bannedCell.appendChild(bannedSelect);
                    editIcon.alt = 'Save';
                    editIcon.src = '/img/save.png';
                    deleteIcon.style.display = 'none';
                } else if (editIcon.alt === 'Save') {

                    // -- При клике на кнопку "Save" сохраняем изменения и вызываем функцию редактирования --

                    let updatedPlayerData = {
                        name: nameCell.querySelector('input').value,
                        title: titleCell.querySelector('input').value,
                        race: raceCell.querySelector('select').value,
                        profession: professionCell.querySelector('select').value,
                        banned: bannedCell.querySelector('select').value
                    };
                    editIcon.alt = 'Edit';
                    editIcon.src = '/img/edit.png';
                    deleteIcon.style.display = 'inline';

                    // -- Возвращаем обычные текстовые данные после сохранения --

                    nameCell.textContent = updatedPlayerData.name.toString();
                    titleCell.textContent = updatedPlayerData.title.toString();
                    raceCell.textContent = updatedPlayerData.race.toString();
                    professionCell.textContent = updatedPlayerData.profession.toString();
                    bannedCell.textContent = updatedPlayerData.banned.toString();
                    updateAccount(player.id, updatedPlayerData);
                }
            });
            editCell.appendChild(editIcon);

            // -- Добавление колонки "Delete" с иконкой удаления --

            let deleteCell = row.insertCell();
            let deleteIconUrl = '/img/delete.png'; // Путь к изображению иконки удаления
            let deleteIcon = document.createElement('img');
            deleteIcon.id = 'delete-button-' + player.id;
            deleteIcon.className = 'delete-button';
            deleteIcon.src = deleteIconUrl;
            deleteIcon.alt = 'Delete';
            deleteIcon.addEventListener('click', function () {
                // Вызываем функцию удаления аккаунта с заданным id
                deleteAccount(player.id);
            });
            deleteCell.appendChild(deleteIcon);
        }
    }

    // -- Вычисление общего количества страниц --
    function calculateTotalPages() {
        totalPages = Math.ceil(totalAccounts / pageSize);
    }

    // -- Обновление спика кнопок с нумерациями страниц --
    function updatePaginationButtons() {
        paginationSection.innerHTML = '';
        for (let i = 0; i < totalPages; i++) {
            let button = document.createElement('button');
            button.textContent = (i + 1).toString();
            button.value = (i).toString();
            button.id = "myButton";
            button.addEventListener('click', function () {
                currentPage = parseInt(this.value);
                getPlayers(currentPage, pageSize);
                updatePaginationButtons();
            });
            paginationSection.appendChild(button);
        }
    }

    // -- Обновление нумерации страниц --
    function updatePagination(accountCount) {
        if (accountCount === 0) {
            paginationSection.innerHTML = '';
            return;
        }
        let paginationButtons = paginationSection.querySelectorAll('button');
        paginationButtons.forEach(function (button) {
            button.disabled = parseInt(button.value) === currentPage;
        });
    }

    // -- Функция изменения размера страницы --
    function changePageSize() {
        pageSize = parseInt(selectElement.value);
        getPlayers(0, pageSize);
        getTotalAccounts();
    }

    document.getElementById('pageSize').addEventListener('change', changePageSize);

    // -- Функция для создания нового акаунта --
    document.addEventListener("DOMContentLoaded", function () {
        // Здесь вы можете поместить ваш код, включая добавление обработчиков событий к элементам DOM
        let createAccount = document.getElementById("createAccountButton");
        if (createAccount) {
            createAccount.addEventListener("click", function () {
                // -- Обработчик события для кнопки "createAccountButton" --
                let nameInput = document.getElementById("name").value;
                let titleInput = document.getElementById("title").value;
                let raceInput = document.getElementById("race").value;
                let professionInput = document.getElementById("profession").value;
                let levelInput = document.getElementById("level").value;
                let birthdayInput = document.getElementById("birthday").value;
                let bannedInput = document.getElementById("banned").value;

                let data = {
                    name: nameInput.toString(),
                    title: titleInput.toString(),
                    race: raceInput.toString(),
                    profession: professionInput.toString(),
                    level: parseInt(levelInput),
                    birthday: new Date(birthdayInput).getTime(),
                    banned: bannedInput === "true",
                }
                let xhr = new XMLHttpRequest();
                xhr.open('POST', '/rest/players', false);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            alert("Data successfully sent to the server");

                            // -- Очистка полей формы после успешного отправления данных --
                            document.getElementById("name").value = "";
                            document.getElementById("title").value = "";
                            document.getElementById("race").value = "HUMAN";
                            document.getElementById("profession").value = "WARRIOR";
                            document.getElementById("level").value = "";
                            document.getElementById("birthday").value = "";
                            document.getElementById("banned").value = "true";

                            getPlayers(currentPage, pageSize);

                        } else {
                            alert("An error occurred while sending data to the server");
                        }
                    }
                };
                xhr.send(JSON.stringify(data));
            });
        } else {
            console.error("Элемент с идентификатором 'myButton' не найден в DOM.");
        }
    });


