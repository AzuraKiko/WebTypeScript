import { v4 as uuidv4 } from "uuid";
import AssetApi from "../page/api/AssetApi";
import PositionsApi from "../page/api/Positions";
import { NumberValidator } from "./validationUtils";

// Type definitions for better type safety
export interface AssetData {
    totAsst: number | string;
    wdrawAvail: number | string;
    realAsst: number | string;
    cash: number | string;
    stockValue: number | string;
    righStockValue: number | string;
    cashDiv: number | string;
    pineBndValue: number | string;
    debt: number | string;
    fee: number | string;
    mgDebt: number | string;
    exptDisbm: number | string;
    balance: number | string;
    advanceAvail: number | string;
    receiveAmt: number | string;
    advanceLoan: number | string;
    buyT0: number | string;
    tdtBuyAmtNotMatch: number | string;
    drvtOdFee: number | string;
    ipCash: number | string;
    totalStock: number | string;
    tavlStockValue: number | string;
    ptavlStockValue: number | string;
    tartStockValue: number | string;
    ptartStockValue: number | string;
    rcvStockValue: number | string;
    sellT0: number | string;
    smsFee: number | string;
    depoFee: number | string;
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

export interface NormalAccountResult {
    navNormal: string;
    gainLossNormal: string;
    percentGainLossNormal: string;
    widthdrawableNormal: string;
    totalAssetNormal: string;
    cashNormal: string;
    percentCash: string;
    balance: string;
    advanceAvail: string;
    maxAdvanceAvail: string;
    haveAdvanceAvail: string;
    dividendAndProfitBond: string;
    totalBuyWaitMatch: string;
    buyWaitMatchByCash: string;
    buyWaitMatchByLoan: string;
    cashBuyNotMatchT0: string;
    cashTichLuy: string;
    taxFeePSWaitT0: string;

    stockNormal: string;
    percentStock: string;
    totalValueStock: string;
    availableStock: string;
    waitTradingStock: string;
    retrictStock: string;
    restrictStockWaitTrading: string;
    dividendStock: string;
    stockBuyWaitReturn: string;
    sellMatchT0: string;
    pineB: string;
    pineBPercent: string;
    originInvest: string;
    traiTucDaNhan: string;
    traiTucSeNhan: string;
    tienNhanDaoHan: string;

    debtNormal: string;
    feeSMS: string;
    percentFeeSMS: string;
    feeVSD: string;
    percentFeeVSD: string;
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
            totalAsset: NumberValidator.formatNumberWithCommas(Number(data.totAsst)),
            widthdrawable: NumberValidator.formatNumberWithCommas(Number(data.wdrawAvail)),
            nav: NumberValidator.formatNumberWithCommas(Number(data.realAsst)),
            cash: NumberValidator.formatNumberWithCommas(Number(data.cash) - Number(data.cashDiv)),
            stock: NumberValidator.formatNumberWithCommas(Number(data.stockValue) - Number(data.righStockValue)),
            dividend: NumberValidator.formatNumberWithCommas(Number(data.cashDiv) + Number(data.righStockValue)),
            PineB: NumberValidator.formatNumberWithCommas(Number(data.pineBndValue)),
            debt: NumberValidator.formatNumberWithCommas(Number(data.debt)),
            fee: NumberValidator.formatNumberWithCommas(Number(data.fee)),
            marginDebt: NumberValidator.formatNumberWithCommas(Number(data.mgDebt) + Number(data.exptDisbm)),
        };
    }

    static normalAccountData(data: AssetData): NormalAccountResult {
        return {
            navNormal: NumberValidator.formatNumberWithCommas(Number(data.realAsst)),
            gainLossNormal: "0",
            percentGainLossNormal: "0",
            widthdrawableNormal: NumberValidator.formatNumberWithCommas(Number(data.wdrawAvail)),
            totalAssetNormal: NumberValidator.formatNumberWithCommas(Number(data.totAsst)),
            cashNormal: NumberValidator.formatNumberWithCommas(Number(data.cash)),
            percentCash: this.formatPercentage((Number(data.cash) / Number(data.totAsst)) * 100),
            balance: NumberValidator.formatNumberWithCommas(Number(data.balance)),
            advanceAvail: NumberValidator.formatNumberWithCommas(Number(data.advanceAvail)),
            maxAdvanceAvail: NumberValidator.formatNumberWithCommas(Number(data.receiveAmt)),
            haveAdvanceAvail: NumberValidator.formatNumberWithCommas(Number(data.advanceLoan)),
            dividendAndProfitBond: NumberValidator.formatNumberWithCommas(Number(data.cashDiv)),
            totalBuyWaitMatch: NumberValidator.formatNumberWithCommas(Number(data.buyT0)),
            buyWaitMatchByCash: NumberValidator.formatNumberWithCommas(Number(data.buyT0) - Number(data.exptDisbm)),
            buyWaitMatchByLoan: NumberValidator.formatNumberWithCommas(Number(data.exptDisbm)),
            cashBuyNotMatchT0: NumberValidator.formatNumberWithCommas(Number(data.tdtBuyAmtNotMatch)),
            cashTichLuy: NumberValidator.formatNumberWithCommas(Number(data.ipCash)),
            taxFeePSWaitT0: NumberValidator.formatNumberWithCommas(Number(data.drvtOdFee)),

            stockNormal: NumberValidator.formatNumberWithCommas(Number(data.stockValue)),
            percentStock: this.formatPercentage((Number(data.stockValue) / Number(data.totAsst)) * 100),
            totalValueStock: NumberValidator.formatNumberWithCommas(Number(data.totalStock)),
            availableStock: NumberValidator.formatNumberWithCommas(Number(data.tavlStockValue)),
            waitTradingStock: NumberValidator.formatNumberWithCommas(Number(data.ptavlStockValue)),
            retrictStock: NumberValidator.formatNumberWithCommas(Number(data.tartStockValue)),
            restrictStockWaitTrading: NumberValidator.formatNumberWithCommas(Number(data.ptartStockValue)),
            dividendStock: NumberValidator.formatNumberWithCommas(Number(data.righStockValue)),
            stockBuyWaitReturn: NumberValidator.formatNumberWithCommas(Number(data.rcvStockValue)),
            sellMatchT0: NumberValidator.formatNumberWithCommas(Number(data.sellT0)),
            pineB: NumberValidator.formatNumberWithCommas(Number(data.pineBndValue)),
            pineBPercent: this.formatPercentage((Number(data.pineBndValue) / Number(data.totAsst)) * 100),
            originInvest: "0",
            traiTucDaNhan: "0",
            traiTucSeNhan: "0",
            tienNhanDaoHan: "0",

            debtNormal: NumberValidator.formatNumberWithCommas(Number(data.debt)),
            feeSMS: NumberValidator.formatNumberWithCommas(Number(data.smsFee)),
            percentFeeSMS: this.formatPercentage((Number(data.smsFee) / Number(data.debt)) * 100),
            feeVSD: NumberValidator.formatNumberWithCommas(Number(data.depoFee)),
            percentFeeVSD: this.formatPercentage((Number(data.depoFee) / Number(data.debt)) * 100),
        };
    }

    /**
     * Calculate percentages for asset data
     */
    static calculatePercentages(data: AssetData): PercentageData {
        return {
            percentCash: this.formatPercentage((Number(data.cash) / Number(data.totAsst)) * 100),
            percentStock: this.formatPercentage((Number(data.stockValue) / Number(data.totAsst)) * 100),
            percentDividend: this.formatPercentage((Number(data.cashDiv) / Number(data.totAsst)) * 100),
            percentPineB: this.formatPercentage((Number(data.pineBndValue) / Number(data.totAsst)) * 100),
            percentFee: this.formatPercentage((Number(data.fee) / Number(data.debt)) * 100),
            percentMarginDebt: this.formatPercentage((Number(data.mgDebt) / Number(data.debt)) * 100),
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
            account: NumberValidator.formatNumberWithCommas(Number(response.data.data.realAsst)),
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
                    gainLoss: NumberValidator.formatNumberWithCommas(Number(totalPosition.gainLoss)),
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
                nav: result.nav,
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
