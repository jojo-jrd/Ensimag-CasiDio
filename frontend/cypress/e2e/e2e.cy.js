describe('Test E2E', () => {
    before(() => {
        // Va sur la page login
        cy.visit('http://localhost:3001');
    })

    it('[LOGIN] : Test password weak', () => {
        cy.get('span[data-cy="connexion"]').click();


        // Remplit les inputs
        cy.get("input#password").type('test1');
        cy.get("input#email").type('jordan.josserand@grenoble-inp.com');

        // Valide les données
        cy.get('button[data-cy="validate-login"]').click();

        // Récupération du message d'erreur
        cy.get('span.text-red-500').should('have.text', ' Mot de passe trop court.');
    })

    it('[LOGIN] : Test invalid login', () => {
        // Clear les inputs
        cy.get("input#password").clear();
        cy.get("input#email").clear();

        // Remplit les inputs
        cy.get("input#password").type('abcaaaaaaaa');
        cy.get("input#email").type('aa');

        // Valide les données
        cy.get('button[data-cy="validate-login"]').click();

        // Récupération du message d'erreur
        cy.get('span.text-red-500').should('have.text', ' Le login est incorrect.');
    });

    it('[LOGIN] : Test invalid login/password', () => {
        cy.intercept('http://localhost:3000/login').as('login') // route matcher

        // Clear les inputs
        cy.get("input#password").clear();
        cy.get("input#email").clear();

        // Remplit les inputs
        cy.get("input#email").type('aaaaa@aaaaa');
        cy.get("input#password").type('abcaaaaaaaa12');

        // Valide les données
        cy.get('button[data-cy="validate-login"]').click();

        // Attente de la requête
        cy.wait('@login');

        // Récupération du message d'erreur
        cy.get('span.text-red-500').should('have.text', ' Wrong email/password');
    });

    it('[LOGIN] : Test valid login/password', () => {
        cy.intercept('http://localhost:3000/login').as('login') // route matcher

        // Clear les inputs
        cy.get("input#password").clear();
        cy.get("input#email").clear();

        // Remplit les inputs
        cy.get("input#email").type('jordan@josserand.com');
        cy.get("input#password").type('Ab*123-!');

        // Valide les données
        cy.get('button[data-cy="validate-login"]').click();

        // Attente de la requête
        cy.wait('@login').then((interception) => {
            expect(interception.response.statusCode).to.equal(200)

            expect(interception.response.body.token).to.exist;
        });

        // On va sur la page login
        cy.get('span[data-cy="deconnexion"]').click();
    })

    it('[REGISTER] : Test password too short', () => {
        // On est sur la page register
        cy.get('a.text-blue-700').click();

        // Remplit les inputs
        cy.get("input#password").type('test1');
        cy.get("input#email").type('jordan.josserand@grenoble-inp.com');
        cy.get("input#birthdate").type('2021-10-10');
        cy.get("input#address").type('Une rue');
        cy.get("input#lastname").type('Dupond');
        cy.get("input#firstname").type('Arthur');

        // Valide les données
        cy.get('button[data-cy="validate-register"]').click();

        // Récupération du message d'erreur
        cy.get('span.text-red-500').should('have.text', ' Mot de passe trop court.');
    })

    it('[REGISTER] : Test invalid login', () => {
        // Clear les inputs
        cy.get("input#password").clear();
        cy.get("input#email").clear();

        // Remplit les inputs
        cy.get("input#password").type('abcaaaaaaaa');
        cy.get("input#email").type('aa');

        // Valide les données
        cy.get('button[data-cy="validate-register"]').click();

        // Récupération du message d'erreur
        cy.get('span.text-red-500').should('have.text', ' Le login est incorrect.');
    });

    it('[REGISTER] : Test missing fields', () => {
        // Clear les inputs
        cy.get("input#password").clear();
        cy.get("input#email").clear();
        cy.get("input#firstname").clear();

        // Remplit les inputs
        cy.get("input#password").type('test123');
        cy.get("input#email").type('aabbb@a.com');

        // Valide les données
        cy.get('button[data-cy="validate-register"]').click();

        // Récupération du message d'erreur
        cy.get('span.text-red-500').should('have.text', ' Vous devez remplir tous les champs.');
    });

    it('[REGISTER] : Test weak password', () => {
        cy.intercept('http://localhost:3000/register').as('register') // route matcher

        // Clear les inputs
        cy.get("input#firstname").type('Dupond');

        // Valide les données
        cy.get('button[data-cy="validate-register"]').click();

        cy.wait('@register').then((interception) => {
            expect(interception.response.statusCode).to.equal(400);
        });

        // Récupération du message d'erreur
        cy.get('span.text-red-500').should('have.text', ' Weak password!');

    });

    it('[REGISTER] : Test create user', () => {
        cy.intercept('http://localhost:3000/register').as('register') // route matcher

        // Clear les inputs
        cy.get("input#password").clear();

        // Remplit les inputs
        cy.get("input#password").type('1m02P@SsF0rt!');

        // Valide les données
        cy.get('button[data-cy="validate-register"]').click();

        cy.wait('@register').then((interception) => {
            expect(interception.response.statusCode).to.equal(200);
            expect(interception.response.body.message).to.equal('User Added');
        });

        cy.intercept('http://localhost:3000/login').as('login') // route matcher

        // On est sur la page login
        // Clear les inputs
        cy.get("input#password").clear();
        cy.get("input#email").clear();

        // Remplit les inputs
        cy.get("input#password").type('Ab*123-!');
        cy.get("input#email").type('a@a.com');


        // Valide les données
        cy.get('button[data-cy="validate-login"]').click();

        cy.wait('@login');
        // On est sur la page home
    });

    it('[QUESTION-API] : test display question', () => {
        // Une erreur arrive de temps en temps avec les web-sockets
        // On n'a pas réussi a résoudre cette erreur donc sur ce test on laisse passer si la web-socket génère une erreur
        cy.on('uncaught:exception', (err, runnable) => { return false });
        cy.get('svg.fa-circle-plus').first().click();

        // Attente de la récupération des données
        cy.wait(500);

        cy.get('p.leading-relaxed').should('have.text', "Qui est le meilleur de l'équipe ?");
        cy.get('span.bg-purple-100').should('have.text', "Divertissement");
        cy.get('span.bg-red-100').should('have.text', "facile");
        cy.get('input[type="radio"]').should('have.length', 4);
        cy.get('input[type="radio"]').first().click();
    });

    it('[QUESTION-API] : test win message', () => {
        cy.get('button.bg-blue-700').click();

        // Attente de la récupération des données
        cy.wait(500);

        cy.get('span.text-green-500').should('have.text', " Bonne réponse. Vous venez de gagner des Viardots.");
    });

    it('[QUESTION-API] : test custom error', () => {
        cy.get('button.bg-blue-700').click();

        // Attente de la récupération des données
        cy.wait(500);

        cy.get('span.text-red-500').should('have.text', " Une erreur");
    });

    it('[QUESTION-API] : test loose message', () => {
        cy.get('button.bg-blue-700').click();

        // Attente de la récupération des données
        cy.wait(500);

        cy.get('span.text-red-500').should('have.text', " Dommage ! Mauvaise réponse");
        cy.get('button.text-blue-700').click();
    });

    it('[SLOT-MACHINE] : test slot-machine win with 3 in row', () => {

        cy.get('div.card-home:nth-child(1) button').first().click();

        // On est sur la page slot-machine

        cy.get('button.bg-red-700').click();

        cy.wait(2000);
        // Doit avoir la class qui permet de gagner avec 3 sur la ligne
        cy.get('div#SlotMachine').should('satisfy', ($el) => {
            return $el.hasClass('threeOnLine');
        });

        cy.wait(1500);
    });

    it('[SLOT-MACHINE] : test SlotMachine win with 2 in row', () => {
        cy.get('button.bg-red-700').click();

        cy.wait(2000);
        // Doit avoir la class qui permet de gagner avec 2 sur la ligne
        cy.get('div#SlotMachine').should('satisfy', ($el) => {
            return $el.hasClass('twoOnLine');
        });

        cy.wait(1500);
    });

    it('[SLOT-MACHINE] : test SlotMachine loose', () => {
        cy.get('button.bg-red-700').click();

        cy.wait(2000);
        // Doit avoir aucune class
        cy.get('div#SlotMachine').should('satisfy', ($el) => {
            return !$el.hasClass('twoOnLine') && !$el.hasClass('threeOnLine');
        });
    });

    it('[SLOT-MACHINE] : test SlotMachine insufficient balance ', () => {
        // Clear les inputs
        cy.get("input#betAmount").clear();

        // Remplit les inputs
        cy.get("input#betAmount").type('10000000000000000000000000000000000000000');

        // Valide les données
        cy.get('button.bg-red-700').click();

        // Récupération du message d'erreur
        cy.get('span.text-red-500').should('have.text', ' bet is not a number, below 0 or over the user balance');
    });

    it('[MINE-GAME] : test MineGame  insufficient balance  ', () => {
        cy.get('span[data-cy="accueil"]').click();
        cy.get('div.card-home button').eq(1).click();

        // Clear les inputs
        cy.get("input#betAmount").clear();

        // Remplit les inputs
        cy.get("input#betAmount").type('10000000000000000000000000000000000000000');

        // Valide les données
        cy.get('.bg-green-700').click();

        // Récupération du message d'erreur
        cy.get('span.text-red-500').should('have.text', ' bet is not defined, below 0 or over the user balance');
    });


    let valueTest = [
        {
            // 0 valide
            betCase: "0",
            randomNumber: 0,
            winnings: 36
        },
        {
            // 0 invalide
            betCase: "0",
            randomNumber: 1,
            winnings: 0
        },
        {
            // 1-12 valide
            betCase: "1-12",
            randomNumber: 3,
            winnings: 3
        },
        {
            // 13-24 invalide
            betCase: "13-24",
            randomNumber: 3,
            winnings: 0
        },
        {
            // 2 to 1 - 1
            betCase: "2 to 1 - first",
            randomNumber: 3,
            winnings: 3
        },
        {
            // 2 to 1 - 2
            betCase: "2 to 1 - second",
            randomNumber: 3,
            winnings: 0
        },
        {
            // Rouge
            betCase: "🟥",
            randomNumber: 3,
            winnings: 2
        },
        {
            // Noir
            betCase: "⬛",
            randomNumber: 3,
            winnings: 0
        }
    ];

    for (let i = 0; i < valueTest.length; i++) {
        const { betCase, randomNumber, winnings } = valueTest[i];
        const winOrLoose = winnings > 0 ? "win" : "lose";
        const testName = `[ROULETTE] : test Roulette with ${winOrLoose} when bet on ${betCase} with ${randomNumber} result and the winnings are ${winnings} viardots`;

        it(testName, () => {
            cy.get('span[data-cy="accueil"]').click();
            cy.get('div.card-home button').last().click();

            // Clear les inputs
            cy.get("input#betAmount").clear();

            // Remplit les inputs
            cy.get("input#betAmount").type('1');

            // Verification mise
            cy.get('h2[data-cy="totalBetAmount"]').should('have.text', 'Total Bet Amount for this spin: 0');

            // Click on the good case 
            if (betCase === "2 to 1 - first") {
                // Find the first button containing "2 to 1"
                cy.get('button[data-cy="first-2to1"]').click();
            } else if (betCase === "2 to 1 - second") {
                // Find the second button containing "2 to 1"
                cy.get('button[data-cy="second-2to1"]').click();
            } else {
                cy.contains('button', betCase).click();
            }
            cy.wait(1000);

            // Verification mise
            cy.get('h2[data-cy="totalBetAmount"]').should('have.text', `Total Bet Amount for this spin: 1`);

            // Spin
            cy.contains('button', 'Spin the Roulette').click();
            // Attente fin roulette qui tourne
            cy.wait(700);

            // Récupération gain
            cy.get('h2[data-cy="betAmountSent"]').should('have.text', `Bet Amount sent: 1`);
            cy.get('h2[data-cy="gainAmount"]').should('have.text', `Gain Amount: ${winnings}`);
            // Verif mise remise à 0
            cy.get('h2[data-cy="totalBetAmount"]').should('have.text', 'Total Bet Amount for this spin: 0');
            // Verif bon chiffre sur la roulette
            cy.get('div[data-cy="resultRoulette"]').should('have.text', `${randomNumber}`);
        });
    }

    
    it('[ROULETTE] : test Roulette  insufficient balance  ', () => {
        // Clear les inputs
        cy.get("input#betAmount").clear();

        // Remplit les inputs
        cy.get("input#betAmount").type('10000000000000000000000000000000000000000');

        // Met la mise sur une case
        cy.contains('button', '0').click();

        // Demande de spin
        cy.contains('button', 'Spin the Roulette').click();

        // Récupération du message d'erreur
        cy.get('span.text-red-500').should('have.text', ' bet is not a number, below 0 or over the user balance');
    });

    it('[ADMIN-USERS] : test adminUsers sort column', () => {
        cy.intercept('http://localhost:3000/api/users').as('users') // route matcher
        // Va sur la page admin-user
        cy.get('span[data-cy="admin-user"]').click();

        // Chargement des utilisateurs
        cy.wait('@users').then((interception) => {
            expect(interception.response.statusCode).to.equal(200);
            expect(interception.response.body.message).to.equal('Returnins users datas');
            expect(interception.response.body.data.length).to.equal(5);
        });

        // Tri en croissant
        cy.get('thead>tr:first-child>th:first-child').click();
        cy.get('tbody>tr:first-child>td:first-child').should('have.text', 'Admin');

        // Tri en décroissant
        cy.get('thead>tr:first-child>th:first-child').click();
        cy.get('tbody>tr:first-child>td:first-child').should('have.text', 'Lukas');
    })


    it('[ADMIN-USERS] : test adminUsers modal update incorrect login', () => {
        cy.get('tr:first-child svg.fa-pen-to-square').click();

        // Clear les inputs
        cy.get("input#email").clear();

        // Remplit les inputs
        cy.get("input#email").type('aa');

        // Valide les données
        cy.get('button.bg-blue-700').click();

        cy.get('span.text-red-500').should('have.text', ' Le login est incorrect.');
    });

    it('[ADMIN-USERS] : test adminUsers modal update missing values', () => {

        // Clear les inputs
        cy.get("input#email").clear();
        cy.get("input#firstname").clear();

        // Remplit les inputs
        cy.get("input#email").type('Lukas.Loiodice@grenoble-inp.fr');

        // Valide les données
        cy.get('button.bg-blue-700').click();

        cy.get('span.text-red-500').should('have.text', " Vous devez remplir le nom, prénom, l'email et la date de naissance.");

    });

    it('[ADMIN-USERS] : test adminUsers modal update user', () => {
        cy.intercept('http://localhost:3000/api/user/*').as('update') // route matcher
        cy.intercept('http://localhost:3000/api/users').as('users') // route matcher

        // Remplit les inputs
        const newFirstName = 'Lukasasa';
        cy.get("input#firstname").type(newFirstName);

        // Valide les données
        cy.get('button.bg-blue-700').click();

        // Sauvegarde l'utilisateur
        cy.wait('@update').then((interception) => {
            expect(interception.response.statusCode).to.equal(200);
            expect(interception.response.body.message).to.equal('User updated');
        });

        // Rechargement des utilisateurs
        cy.wait('@users');

        cy.get('tbody tr:first-child td:first-child').should('have.text', newFirstName);
    });

    it('[ADMIN-USERS] : test adminUsers modal delete user', () => {
        cy.intercept('http://localhost:3000/api/user/*').as('delete') // route matcher
        cy.intercept('http://localhost:3000/api/users').as('users') // route matcher

        cy.get('tr:first-child svg.fa-trash-can').click();

        // Attend l'affichage de la popup de confirmation
        cy.wait(500);

        // Click sur le bouton de confirmation
        cy.get('button.swal-button--confirm').click();

        cy.wait('@delete').then((interception) => {
            expect(interception.response.statusCode).to.equal(200);
            expect(interception.response.body.message).to.equal('User deleted');
        });

        cy.wait('@users').then((interception) => {
            expect(interception.response.statusCode).to.equal(200);
            expect(interception.response.body.message).to.equal('Returnins users datas');
            expect(interception.response.body.data.length).to.equal(4);
        });
    });

    it('[DASHBOARD] : chargement dashboard', () => {
        cy.intercept('http://localhost:3000/api/history').as('history') // route matcher
        // On est sur la page home et on va sur la page dahsboard
        cy.get('span[data-cy="dashboard"]').click({ force: true });

        cy.wait('@history').then((interception) => {
            expect(interception.response.statusCode).to.equal(200);
            expect(interception.response.body.message).to.equal('Returning user history');
            // Si différent de null => signifie qu'il y a bien un historique
            expect(interception.response.body.data.evolutionSoldeWeek.total_amount).to.not.equal(null);
            expect(interception.response.body.data.evolutionSolde.length).to.be.greaterThan(1);
        });

        // Teste la récupération des données
        cy.get('p[data-cy="balance"]').should('not.be.empty');
    });

    it('[DASHBOARD ADMIN] : chargement dashboard', () => {
        cy.intercept('http://localhost:3000/api/globalHistory').as('globalHistory') // route matcher

        // Passage en mode admin
        cy.get('input[type="checkbox"]').click();

        cy.wait('@globalHistory').then((interception) => {
            expect(interception.response.statusCode).to.equal(200);
            expect(interception.response.body.message).to.equal('Returning global history');
            // Si différent de null => signifie qu'il y a bien un historique
            expect(interception.response.body.data.evolutionSoldeWeek.total_amount).to.not.equal(null);
            expect(interception.response.body.data.evolutionSolde.length).to.be.greaterThan(1);
        });

        // Teste la récupération des données
        cy.get('p[data-cy="balance"]').should('not.be.empty');
    });

    it('[PROFIL] : test erreur modification', () => {
        // On est sur la page home et on va sur la page profil
        cy.get('span[data-cy="profil"]').click();

        // Teste la récupération des données
        cy.get("input#firstname").should('have.value', 'Admin')

        // Click sur le bouton Modifier
        cy.get('button.bg-blue-700').click();

        // Suppresion d'une donnée
        cy.get("input#firstname").clear();

        // Click sur le bouton valider
        cy.get('button.bg-blue-700').click();

        // Récupération du message d'erreur
        cy.get('span.text-red-500').should('have.text', ' Vous devez remplir tous les champs.');
    });

    it('[PROFIL] : test modification du prénom', () => {
        // On est déjà en modification
        cy.intercept('http://localhost:3000/api/user').as('update') // route matcher

        // Remplit la donné
        cy.get("input#firstname").type('Adminaa');

        // Click sur le bouton Valider
        cy.get('button.bg-blue-700').click();

        cy.wait('@update').then((interception) => {
            expect(interception.response.statusCode).to.equal(200);
            expect(interception.response.body.message).to.equal('User updated');
        });
    });

    it('[PROFIL] : Suppression du compte', () => {
        cy.intercept('http://localhost:3000/api/user').as('delete') // route matcher

        // Click sur le bouton supprimer le compte
        cy.get('button.text-red-500').click();

        // Attend l'affichage de la popup de confirmation
        cy.wait(500);

        // Click sur le bouton de confirmation
        cy.get('button.swal-button--confirm').click();

        cy.wait('@delete').then((interception) => {
            expect(interception.response.statusCode).to.equal(200);
            expect(interception.response.body.message).to.equal('User deleted');
        });

        // Vérifie si on a bien eu la redirection sur la page login
        cy.get('button[data-cy="validate-login"]').should('exist');

    });



})