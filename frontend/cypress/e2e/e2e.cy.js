describe('Test E2E', () => {
    before(() => {
        // Va sur la page login
        cy.visit('http://localhost:3001');
        // TODO: suppression des élement créées.
    })

    it('[LOGIN] : Test password weak' , () => {
        

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

    it('[REGISTER] : Test password weak', () => {
        // On est sur la page register
        cy.get('a.text-blue-700').click();

        // Remplit les inputs
        cy.get("input#password").type('test1');
        cy.get("input#email").type('jordan.josserand@grenoble-inp.com');
        cy.get("input#birthdate").type('2021-10-10');
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
        cy.get("input#password").type('Ab*123-!123&');
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

    });

    it('[SLOT-MACHINE] : test slot-machine win with 3 in row', () => {
        cy.intercept('http://localhost:3000/login').as('login') // route matcher
        cy.intercept('http://localhost:3000/games').as('home')
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

        // TODO suite
        // BIEN RETOURNER SUR LA PAGE HOME A LA FIN


        // cy.wait('@home');
        // cy.get('div.card-home:first-child button').click();

        // // On est sur la page slot-machine

        // cy.get('button.bg-red-700').click();

        // cy.wait(2000);

        // // TODO: TEST route credit a faire

        // cy.get('div#slot-machine').should('satisfy', ($el) => {
        //     return $el.hasClass('threeOnLine');
        // });

        // cy.wait(1000);
    });

    // it('[SlotMachine] : test SlotMachine win with 2 in row', () => {
    //     cy.get('button.bg-red-700').click();

    //     cy.wait(2000);

    //     // TODO: TEST route credit a faire

    //     cy.get('div#SlotMachine').should('satisfy', ($el) => {
    //         return $el.hasClass('twoOnLine');
    //     });

    //     cy.wait(1000);
    // })









    // TODO faire le reste avant de faire la suppresion

    it('[Profil] : test erreur modification', () => {
        cy.intercept('http://localhost:3000/login').as('login') // route matcher
        cy.intercept('http://localhost:3000/games').as('home')
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

    it('[Profil] : test modification du prénom', () => {
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

    it('[Profil] : Suppression du compte', () => {
        cy.intercept('http://localhost:3000/api/user').as('delete') // route matcher

        // Click sur le bouton supprimer le compte
        cy.get('button.text-red-500').click();

        // Attend l'affichage de la popup de confirmation
        cy.wait(500); // TODO: voir si utile

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