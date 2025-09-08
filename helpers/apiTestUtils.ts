import { v4 as uuidv4 } from "uuid";
import AssetApi from "../page/api/AssetApi";
import PositionsApi from "../page/api/Positions";
import { NumberValidator } from "./validationUtils";

// Type definitions for better type safety
export interface AssetData {
    totAsst: number;
    wdrawAvail: number;
    realAsst: number;
    cash: number;
    stockValue: number;
    cashDiv: number;
    pineBndValue: number;
    debt: number;
    fee: number;
    mgDebt: number;
}

export interface FormattedAssetData {
    totalAsset: string;
    widthdrawable: string;
    nav: string;
    cash: string;
    stock: string;
    dividend: string;
    PineB: string;
    debt: string;
    fee: string;
    marginDebt: string;
}

export interface PercentageData {
    percentCash: string;
    percentStock: string;
    percentDividend: string;
    percentPineB: string;
    percentFee: string;
    percentMarginDebt: string;
}

export interface AccountResult {
    account: string;
    percent: string;
}

export interface PositionResult {
    gainLoss: string | number;
    percentGainLoss: string | number;
}

export interface BaseApiParams {
    user: string;
    session: string;
    acntNo: string;
}

/**
 * Helper functions for data processing and formatting
 */
export class ApiTestUtils {

    /**
     * Format percentage with 2 decimal places
     */
    static formatPercentage(value: number): string {
        return value.toFixed(2);
    }

    /**
     * Format asset data with comma separators
     */
    static formatAssetData(data: AssetData): FormattedAssetData {
        return {
            totalAsset: NumberValidator.formatNumberWithCommas(data.totAsst),
            widthdrawable: NumberValidator.formatNumberWithCommas(data.wdrawAvail),
            nav: NumberValidator.formatNumberWithCommas(data.realAsst),
            cash: NumberValidator.formatNumberWithCommas(data.cash),
            stock: NumberValidator.formatNumberWithCommas(data.stockValue),
            dividend: NumberValidator.formatNumberWithCommas(data.cashDiv),
            PineB: NumberValidator.formatNumberWithCommas(data.pineBndValue),
            debt: NumberValidator.formatNumberWithCommas(data.debt),
            fee: NumberValidator.formatNumberWithCommas(data.fee),
            marginDebt: NumberValidator.formatNumberWithCommas(data.mgDebt),
        };
    }

    /**
     * Calculate percentages for asset data
     */
    static calculatePercentages(data: AssetData): PercentageData {
        return {
            percentCash: this.formatPercentage((data.cash / data.totAsst) * 100),
            percentStock: this.formatPercentage((data.stockValue / data.totAsst) * 100),
            percentDividend: this.formatPercentage((data.cashDiv / data.totAsst) * 100),
            percentPineB: this.formatPercentage((data.pineBndValue / data.totAsst) * 100),
            percentFee: this.formatPercentage((data.fee / data.debt) * 100),
            percentMarginDebt: this.formatPercentage((data.mgDebt / data.debt) * 100),
        };
    }

    /**
     * Process account data for a specific sub-account
     */
    static async processAccountData(
        assetApi: AssetApi,
        params: BaseApiParams,
        subAcntNo: string,
        baseRealAsst: number
    ): Promise<AccountResult> {
        const response = await assetApi.getTotalAssetAll({
            ...params,
            subAcntNo,
            rqId: uuidv4(),
        });

        return {
            account: NumberValidator.formatNumberWithCommas(response.data.data.realAsst),
            percent: this.formatPercentage((response.data.data.realAsst / baseRealAsst) * 100),
        };
    }

    /**
     * Process position data for a specific sub-account
     */
    static async processPositionData(
        positionsApi: PositionsApi,
        params: BaseApiParams,
        subAcntNo: string
    ): Promise<PositionResult> {
        const response = await positionsApi.getPositionsAll({
            ...params,
            subAcntNo,
            rqId: uuidv4(),
            getBondQty: "Y",
            AorN: "S",
        });

        if (response.data.data.length > 0) {
            const totalPosition = response.data.data.find((position: any) => position.symbol === "TOTAL");
            if (totalPosition) {
                return {
                    gainLoss: NumberValidator.formatNumberWithCommas(totalPosition.gainLoss),
                    percentGainLoss: this.formatPercentage(Number(totalPosition.gainLossPc)),
                };
            }
        }

        console.log(`No total position found for subAccount: ${subAcntNo}`);
        return { gainLoss: 0, percentGainLoss: 0 };
    }

    /**
     * Process multiple accounts in parallel
     */
    static async processMultipleAccounts(
        assetApi: AssetApi,
        baseParams: BaseApiParams,
        subAccounts: string[],
        baseRealAsst: number
    ): Promise<AccountResult[]> {
        const promises = subAccounts.map(subAcnt =>
            this.processAccountData(assetApi, baseParams, subAcnt, baseRealAsst)
        );

        return Promise.all(promises);
    }

    /**
     * Process multiple positions in parallel
     */
    static async processMultiplePositions(
        positionsApi: PositionsApi,
        baseParams: BaseApiParams,
        subAccounts: string[]
    ): Promise<PositionResult[]> {
        const promises = subAccounts.map(subAcnt =>
            this.processPositionData(positionsApi, baseParams, subAcnt)
        );

        return Promise.all(promises);
    }

    /**
     * Build card data structures for reporting
     */
    static buildCardData(result: any) {
        return {
            card1: {
                nav: result.nav,
                gainLoss: result.gainLoss,
                percentGainLoss: result.percentGainLoss,
                widthdrawable: result.widthdrawable,
            },
            card2Data: {
                normalAccount: result.normalAccount,
                gainLossNormal: result.gainLossNormal,
                percentGainLossNormal: result.percentGainLossNormal,
                marginAccount: result.marginAccount,
                gainLossMargin: result.gainLossMargin,
                percentGainLossMargin: result.percentGainLossMargin,
                derivativeAccount: result.derivativeAccount,
                gainLossDerivative: result.gainLossDerivative,
                percentGainLossDerivative: result.percentGainLossDerivative,
                folioAccount: result.folioAccount,
                gainLossFolio: result.gainLossFolio,
                percentGainLossFolio: result.percentGainLossFolio,
            },
            card2Chart: {
                normalAccount: result.normalAccount,
                percentNormalAccount: result.percentNormalAccount,
                marginAccount: result.marginAccount,
                percentMarginAccount: result.percentMarginAccount,
                derivativeAccount: result.derivativeAccount,
                percentDerivativeAccount: result.percentDerivativeAccount,
                folioAccount: result.folioAccount,
                percentFolioAccount: result.percentFolioAccount,
            },
            card3Asset: {
                totalAsset: result.totalAsset,
                cash: result.cash,
                percentCash: result.percentCash,
                stock: result.stock,
                percentStock: result.percentStock,
                dividend: result.dividend,
                percentDividend: result.percentDividend,
                PineB: result.PineB,
                percentPineB: result.percentPineB,
            },
            card3Debt: {
                debt: result.debt,
                fee: result.fee,
                percentFee: result.percentFee,
                marginDebt: result.marginDebt,
                percentMarginDebt: result.percentMarginDebt,
            }
        };
    }

    /**
     * Log card data in a formatted way
     */
    static logCardData(cardData: any): void {
        console.log(cardData.card1);
        console.log("--------------------------------");
        console.log(cardData.card2Data);
        console.log("--------------------------------");
        console.log(cardData.card2Chart);
        console.log("--------------------------------");
        console.log(cardData.card3Asset);
        console.log("--------------------------------");
        console.log(cardData.card3Debt);
    }
}
