describe('General Usage Tests', () => {
    it('loads the page correctly', () => {
        cy.visit('/');
        cy.contains('Fido2020');
    });
});