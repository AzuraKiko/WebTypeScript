import { Selector, t } from 'testcafe';
import BasePage from './BasePage';

class ProductPage extends BasePage {
    productTitle: Selector;
    productPrice: Selector;
    productDescription: Selector;
    addToCartButton: Selector;
    quantityInput: Selector;
    productImages: Selector;
    reviewsSection: Selector;
    sizeOptions: Selector;
    colorOptions: Selector;

    constructor() {
        super();
        this.productTitle = Selector('.product-title');
        this.productPrice = Selector('.product-price');
        this.productDescription = Selector('.product-description');
        this.addToCartButton = Selector('#addToCart');
        this.quantityInput = Selector('#quantity');
        this.productImages = Selector('.product-image');
        this.reviewsSection = Selector('#reviews');
        this.sizeOptions = Selector('.size-option');
        this.colorOptions = Selector('.color-option');
    }

    async getProductName(): Promise<string> {
        return await this.productTitle.innerText;
    }

    async getProductPrice(): Promise<string> {
        return await this.productPrice.innerText;
    }

    async selectSize(size: string) {
        await t.click(this.sizeOptions.withText(size));
    }

    async selectColor(color: string) {
        await t.click(this.colorOptions.withAttribute('data-color', color));
    }

    async setQuantity(quantity: number) {
        await t.selectText(this.quantityInput)
              .pressKey('delete')
              .typeText(this.quantityInput, quantity.toString());
    }

    async addToCart() {
        await t.click(this.addToCartButton);
    }

    async viewProductImage(index: number) {
        await t.click(this.productImages.nth(index));
    }

    async scrollToReviews() {
        await t.scrollIntoView(this.reviewsSection);
    }
}

export default new ProductPage(); 