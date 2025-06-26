import { Selector, t } from 'testcafe';

class ProfilePage {
    nameField: Selector;
    emailField: Selector;
    phoneField: Selector;
    addressField: Selector;
    saveButton: Selector;
    changePasswordButton: Selector;

    constructor() {
        this.nameField = Selector('#fullName');
        this.emailField = Selector('#email');
        this.phoneField = Selector('#phone');
        this.addressField = Selector('#address');
        this.saveButton = Selector('#saveProfile');
        this.changePasswordButton = Selector('#changePassword');
    }

    async updateName(name: string) {
        await t.selectText(this.nameField)
              .pressKey('delete')
              .typeText(this.nameField, name);
    }

    async updateEmail(email: string) {
        await t.selectText(this.emailField)
              .pressKey('delete')
              .typeText(this.emailField, email);
    }

    async saveProfile() {
        await t.click(this.saveButton);
    }

    async navigateToChangePassword() {
        await t.click(this.changePasswordButton);
    }
}

export default new ProfilePage(); 