describe('Login Tests', () => {
    it('allows a valid user to login', () => {
        cy.visit('/');

        cy.get('header nav a[href="/login"]').click();
        cy.get('#login').type('admin');
        cy.get('#password').type('1qA2wS3eD');
        cy.get('input[value="Login"]').click();

        cy.contains('What’s on your mind?');
    });

    it('disallows an invalid user to login', () => {
        cy.visit('/');

        cy.get('header nav a[href="/login"]').click();
        cy.get('#login').type('admin');
        cy.get('#password').type('1qA2wS3eD1');
        cy.get('input[value="Login"]').click();

        cy.contains('Failed to login.');
    });
});
