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
        cy.get('button').click();

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
        cy.get('button').click();

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
        cy.get('button').click();

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
        cy.get('button').click();

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
        cy.get('button').click();

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
        cy.get('button').click();

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
        cy.get('button').click();

        // Récupération du message d'erreur
        cy.get('span.text-red-500').should('have.text', ' Vous devez remplir tous les champs.');
    });

    it('[REGISTER] : Test weak password', () => {
        cy.intercept('http://localhost:3000/register').as('register') // route matcher

        // Clear les inputs
        cy.get("input#firstname").type('Dupond');

        // Valide les données
        cy.get('button').click();

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
        cy.get('button').click();

        cy.wait('@register').then((interception) => {
            expect(interception.response.statusCode).to.equal(200);
            console.log(interception.response)
            expect(interception.response.body.message).to.equal('User Added');
        });

        
        
    });

    // On est sur la page login
    // TODO se connecter avant de tester le reste
    
})