import { v4 as uuidv4 } from "uuid";
import AssetApi from "../page/api/AssetApi";
import PositionsApi from "../page/api/PositionsApi";
import { NumberValidator } from "./validationUtils";

// Constants for calculations and formatting
const PERCENTAGE_PRECISION = 2;
const DEFAULT_ZERO_VALUE = "0";
const PERCENTAGE_MULTIPLIER = 100;

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
    prinDebt?: number | string;
    intDebt?: number | string;
    marginRatio?: number | string;
    drvtVsdAmt?: number | string;
    drvtCIm?: number | string;
    drvtCdtPnlVM?: number | string;
    drvtCdtLossVM?: number | string;

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
    drvtVsdAmt: string;
    cashVsd: string;
    gainVM: string;
    lossVM: string;

}

export interface PercentageData {
    percentCash: string;
    percentStock: string;
    percentDividend: string;
    percentPineB: string;
    percentFee: string;
    percentMarginDebt: string;
    percentDrvtVsdAmt: string;
}

export interface CommonAccountData {
    nav: string;
    gainLoss: string;
    percentGainLoss: string;
    widthdrawable: string;

    totalAsset: string;
    cash: string;
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

    stock: string;
    percentStock: string;
    totalValueStock: string;
    availableStock: string;
    waitTradingStock: string;
    retrictStock: string;
    restrictStockWaitTrading: string;
    dividendStock: string;
    stockBuyWaitReturn: string;
    sellMatchT0: string;

    feeSMS: string;
    feeVSD: string;
}

export interface AccountResult {
    account: string;
    percent: string;
    cash: string | number;
}

export interface PositionResult {
    gainLoss: string | number;
    percentGainLoss: string | number;
}

export interface HoldStockResult {
    symbol: string;
    marketValue: string;
    capitalValue: string;
    qty: string;
    capitalPrice: string;
    gainLoss: string;
    percentGainLoss: string;
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

    holdStock: HoldStockResult[];
}

export interface MarginAccountResult {
    navMargin: string;
    totalAssetMargin: string;
    gainLossMargin: string;
    percentGainLossMargin: string;
    widthdrawableMargin: string;
    rtt: string;

    cashMargin: string;
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

    stockMargin: string;
    percentStock: string;
    totalValueStock: string;
    availableStock: string;
    waitTradingStock: string;
    retrictStock: string;
    restrictStockWaitTrading: string;
    dividendStock: string;
    stockBuyWaitReturn: string;
    sellMatchT0: string;

    totalDebtMargin: string;
    totalMargin: string;
    percentTotalMargin: string;
    originMargin: string;
    interestMargin: string;

    totalFeeTrading: string;
    percentTotalFeeTrading: string;
    feeSMS: string;
    feeVSD: string;

    expectedDisbursement: string;
    percentExpectedDisbursement: string;

    holdStock: HoldStockResult[];
}

export interface FolioAccountResult {
    navFolio: string;
    gainLossFolio: string;
    percentGainLossFolio: string;
    widthdrawableFolio: string;

    totalAssetFolio: string;
    cashFolio: string;
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

    stockFolio: string;
    percentStock: string;
    totalValueStock: string;
    availableStock: string;
    waitTradingStock: string;
    retrictStock: string;
    restrictStockWaitTrading: string;
    dividendStock: string;
    stockBuyWaitReturn: string;
    sellMatchT0: string;

    debtFolio: string;
    feeSMS: string;
    percentFeeSMS: string;
    feeVSD: string;
    percentFeeVSD: string;

    holdStock: HoldStockResult[];
}

export interface BaseApiParams {
    user: string;
    session: string;
    acntNo: string;
}

/**
 * Helper functions for data processing and formatting
 */
export class ApiAssetUtils {

    /**
     * Format percentage with specified decimal places
     */
    static formatPercentage(value: number, precision: number = PERCENTAGE_PRECISION): string {
        if (isNaN(value) || !isFinite(value)) {
            return DEFAULT_ZERO_VALUE;
        }
        return (Math.round((value + Number.EPSILON) * Math.pow(10, precision)) / Math.pow(10, precision)).toFixed(precision);
    }

    /**
     * Safe number conversion with validation
     */
    static safeNumber(value: number | string | undefined): number {
        if (value === undefined || value === null) return 0;

        let strValue: string;
        if (typeof value === 'string') {
            strValue = value.includes(',') ? value.replace(/,/g, '') : value;
        } else {
            strValue = value.toString();
        }

        const num = parseFloat(strValue);
        return isNaN(num) || !isFinite(num) ? 0 : num;
    }


    /**
     * Format number with commas using safe conversion
     */
    static formatWithCommas(value: number | string | undefined): string {
        return NumberValidator.formatNumberWithCommas(this.safeNumber(value));
    }

    /**
     * Calculate percentage safely
     */
    static calculatePercentage(numerator: number | string | undefined, denominator: number | string | undefined): string {
        const num = this.safeNumber(numerator);
        const denom = this.safeNumber(denominator);

        if (denom === 0) return DEFAULT_ZERO_VALUE;
        return this.formatPercentage((num / denom) * PERCENTAGE_MULTIPLIER);
    }

    /**
     * Generate common account calculations
     */
    private static generateCommonAccountData(data: AssetData): CommonAccountData {
        return {
            nav: this.formatWithCommas(data.realAsst),
            gainLoss: DEFAULT_ZERO_VALUE,
            percentGainLoss: DEFAULT_ZERO_VALUE,
            widthdrawable: this.formatWithCommas(data.wdrawAvail),

            totalAsset: this.formatWithCommas(data.totAsst),
            cash: this.formatWithCommas(data.cash),
            percentCash: this.calculatePercentage(data.cash, data.totAsst),
            balance: this.formatWithCommas(data.balance),
            advanceAvail: this.formatWithCommas(data.advanceAvail),
            maxAdvanceAvail: this.formatWithCommas(data.receiveAmt),
            haveAdvanceAvail: this.formatWithCommas(data.advanceLoan),
            dividendAndProfitBond: this.formatWithCommas(data.cashDiv),
            totalBuyWaitMatch: this.formatWithCommas(data.buyT0),
            buyWaitMatchByCash: this.formatWithCommas(this.safeNumber(data.buyT0) - this.safeNumber(data.exptDisbm)),
            buyWaitMatchByLoan: this.formatWithCommas(data.exptDisbm),
            cashBuyNotMatchT0: this.formatWithCommas(data.tdtBuyAmtNotMatch),
            cashTichLuy: this.formatWithCommas(data.ipCash),
            taxFeePSWaitT0: this.formatWithCommas(data.drvtOdFee),

            stock: this.formatWithCommas(data.stockValue),
            percentStock: this.calculatePercentage(data.stockValue, data.totAsst),
            totalValueStock: this.formatWithCommas(data.totalStock),
            availableStock: this.formatWithCommas(data.tavlStockValue),
            waitTradingStock: this.formatWithCommas(data.ptavlStockValue),
            retrictStock: this.formatWithCommas(data.tartStockValue),
            restrictStockWaitTrading: this.formatWithCommas(data.ptartStockValue),
            dividendStock: this.formatWithCommas(data.righStockValue),
            stockBuyWaitReturn: this.formatWithCommas(data.rcvStockValue),
            sellMatchT0: this.formatWithCommas(data.sellT0),

            feeSMS: this.formatWithCommas(data.smsFee),
            feeVSD: this.formatWithCommas(data.depoFee),
        };
    }

    /**
     * Format asset data with comma separators (optimized)
     */
    static formatAssetData(data: AssetData): FormattedAssetData {
        return {
            totalAsset: this.formatWithCommas(data.totAsst),
            widthdrawable: this.formatWithCommas(data.wdrawAvail),
            nav: this.formatWithCommas(data.realAsst),
            cash: this.formatWithCommas(this.safeNumber(data.cash) - this.safeNumber(data.cashDiv)),
            stock: this.formatWithCommas(this.safeNumber(data.stockValue) - this.safeNumber(data.righStockValue)),
            dividend: this.formatWithCommas(this.safeNumber(data.cashDiv) + this.safeNumber(data.righStockValue)),
            PineB: this.formatWithCommas(data.pineBndValue),
            debt: this.formatWithCommas(data.debt),
            fee: this.formatWithCommas(data.fee),
            marginDebt: this.formatWithCommas(this.safeNumber(data.mgDebt) + this.safeNumber(data.exptDisbm)),
            drvtVsdAmt: this.formatWithCommas(data.drvtVsdAmt),
            cashVsd: this.formatWithCommas(data.drvtCIm),
            gainVM: this.formatWithCommas(data.drvtCdtPnlVM),
            lossVM: this.formatWithCommas(data.drvtCdtLossVM),
        };
    }

    /**
     * Generate normal account data (optimized with common data reuse)
     */
    static normalAccountData(data: AssetData): NormalAccountResult {
        const commonData = this.generateCommonAccountData(data);

        return {
            navNormal: commonData.nav,
            gainLossNormal: commonData.gainLoss,
            percentGainLossNormal: commonData.percentGainLoss,
            widthdrawableNormal: commonData.widthdrawable,

            totalAssetNormal: commonData.totalAsset,
            cashNormal: commonData.cash,
            percentCash: commonData.percentCash,
            balance: commonData.balance,
            advanceAvail: commonData.advanceAvail,
            maxAdvanceAvail: commonData.maxAdvanceAvail,
            haveAdvanceAvail: commonData.haveAdvanceAvail,
            dividendAndProfitBond: commonData.dividendAndProfitBond,
            totalBuyWaitMatch: commonData.totalBuyWaitMatch,
            buyWaitMatchByCash: commonData.buyWaitMatchByCash,
            buyWaitMatchByLoan: commonData.buyWaitMatchByLoan,
            cashBuyNotMatchT0: commonData.cashBuyNotMatchT0,
            cashTichLuy: commonData.cashTichLuy,
            taxFeePSWaitT0: commonData.taxFeePSWaitT0,

            stockNormal: commonData.stock,
            percentStock: commonData.percentStock,
            totalValueStock: commonData.totalValueStock,
            availableStock: commonData.availableStock,
            waitTradingStock: commonData.waitTradingStock,
            retrictStock: commonData.retrictStock,
            restrictStockWaitTrading: commonData.restrictStockWaitTrading,
            dividendStock: commonData.dividendStock,
            stockBuyWaitReturn: commonData.stockBuyWaitReturn,
            sellMatchT0: commonData.sellMatchT0,

            pineB: this.formatWithCommas(data.pineBndValue),
            pineBPercent: this.calculatePercentage(data.pineBndValue, data.totAsst),
            originInvest: DEFAULT_ZERO_VALUE,
            traiTucDaNhan: DEFAULT_ZERO_VALUE,
            traiTucSeNhan: DEFAULT_ZERO_VALUE,
            tienNhanDaoHan: DEFAULT_ZERO_VALUE,

            debtNormal: this.formatWithCommas(data.debt),
            feeSMS: commonData.feeSMS,
            percentFeeSMS: this.calculatePercentage(data.smsFee, data.debt),
            feeVSD: commonData.feeVSD,
            percentFeeVSD: this.calculatePercentage(data.depoFee, data.debt),

            holdStock: [],
        };
    }

    static follioAccountData(data: AssetData): FolioAccountResult {
        const commonData = this.generateCommonAccountData(data);

        return {
            navFolio: commonData.nav,
            gainLossFolio: commonData.gainLoss,
            percentGainLossFolio: commonData.percentGainLoss,
            widthdrawableFolio: commonData.widthdrawable,

            totalAssetFolio: commonData.totalAsset,
            cashFolio: commonData.cash,
            percentCash: commonData.percentCash,
            balance: commonData.balance,
            advanceAvail: commonData.advanceAvail,
            maxAdvanceAvail: commonData.maxAdvanceAvail,
            haveAdvanceAvail: commonData.haveAdvanceAvail,
            dividendAndProfitBond: commonData.dividendAndProfitBond,
            totalBuyWaitMatch: commonData.totalBuyWaitMatch,
            buyWaitMatchByCash: commonData.buyWaitMatchByCash,
            buyWaitMatchByLoan: commonData.buyWaitMatchByLoan,
            cashBuyNotMatchT0: commonData.cashBuyNotMatchT0,
            cashTichLuy: commonData.cashTichLuy,
            taxFeePSWaitT0: commonData.taxFeePSWaitT0,

            stockFolio: commonData.stock,
            percentStock: commonData.percentStock,
            totalValueStock: commonData.totalValueStock,
            availableStock: commonData.availableStock,
            waitTradingStock: commonData.waitTradingStock,
            retrictStock: commonData.retrictStock,
            restrictStockWaitTrading: commonData.restrictStockWaitTrading,
            dividendStock: commonData.dividendStock,
            stockBuyWaitReturn: commonData.stockBuyWaitReturn,
            sellMatchT0: commonData.sellMatchT0,

            debtFolio: this.formatWithCommas(data.debt),
            feeSMS: commonData.feeSMS,
            percentFeeSMS: this.calculatePercentage(data.smsFee, data.debt),
            feeVSD: commonData.feeVSD,
            percentFeeVSD: this.calculatePercentage(data.depoFee, data.debt),

            holdStock: [],
        };
    }

    /**
     * Generate margin account data (optimized with common data reuse)
     */
    static marginAccountData(data: AssetData): MarginAccountResult {
        const commonData = this.generateCommonAccountData(data);

        return {
            navMargin: commonData.nav,
            gainLossMargin: commonData.gainLoss,
            percentGainLossMargin: commonData.percentGainLoss,
            widthdrawableMargin: commonData.widthdrawable,
            rtt: this.formatPercentage(this.safeNumber(data.marginRatio)),

            totalAssetMargin: commonData.totalAsset,
            cashMargin: commonData.cash,
            percentCash: commonData.percentCash,
            balance: commonData.balance,
            advanceAvail: commonData.advanceAvail,
            maxAdvanceAvail: commonData.maxAdvanceAvail,
            haveAdvanceAvail: commonData.haveAdvanceAvail,
            dividendAndProfitBond: commonData.dividendAndProfitBond,
            totalBuyWaitMatch: commonData.totalBuyWaitMatch,
            buyWaitMatchByCash: commonData.buyWaitMatchByCash,
            buyWaitMatchByLoan: commonData.buyWaitMatchByLoan,
            cashBuyNotMatchT0: commonData.cashBuyNotMatchT0,
            cashTichLuy: commonData.cashTichLuy,
            taxFeePSWaitT0: commonData.taxFeePSWaitT0,

            stockMargin: commonData.stock,
            percentStock: commonData.percentStock,
            totalValueStock: commonData.totalValueStock,
            availableStock: commonData.availableStock,
            waitTradingStock: commonData.waitTradingStock,
            retrictStock: commonData.retrictStock,
            restrictStockWaitTrading: commonData.restrictStockWaitTrading,
            dividendStock: commonData.dividendStock,
            stockBuyWaitReturn: commonData.stockBuyWaitReturn,
            sellMatchT0: commonData.sellMatchT0,

            totalDebtMargin: this.formatWithCommas(data.debt),
            totalMargin: this.formatWithCommas(data.mgDebt),
            percentTotalMargin: this.calculatePercentage(data.mgDebt, data.debt),
            originMargin: this.formatWithCommas(data.prinDebt),
            interestMargin: this.formatWithCommas(data.intDebt),

            totalFeeTrading: this.formatWithCommas(data.fee),
            percentTotalFeeTrading: this.calculatePercentage(data.fee, data.debt),
            feeSMS: commonData.feeSMS,
            feeVSD: commonData.feeVSD,

            expectedDisbursement: this.formatWithCommas(data.exptDisbm),
            percentExpectedDisbursement: this.calculatePercentage(data.exptDisbm, data.debt),

            holdStock: [],
        };
    }

    /**
     * Calculate percentages for asset data (optimized)
     */
    static calculatePercentages(data: AssetData): PercentageData {
        const cashMinusDiv = this.safeNumber(data.cash) - this.safeNumber(data.cashDiv);

        return {
            percentCash: this.calculatePercentage(cashMinusDiv, data.totAsst),
            percentStock: this.calculatePercentage(data.stockValue, data.totAsst),
            percentDividend: this.calculatePercentage(data.cashDiv, data.totAsst),
            percentPineB: this.calculatePercentage(data.pineBndValue, data.totAsst),
            percentDrvtVsdAmt: this.calculatePercentage(data.drvtVsdAmt, data.totAsst),
            percentFee: this.calculatePercentage(data.fee, data.debt),
            percentMarginDebt: this.calculatePercentage(data.mgDebt, data.debt),
        };
    }

    /**
     * Process account data for a specific sub-account (with error handling)
     */
    static async processAccountData(
        assetApi: AssetApi,
        params: BaseApiParams,
        subAcntNo: string,
        baseRealAsst: number
    ): Promise<AccountResult> {
        try {
            const response = await assetApi.getTotalAssetAll({
                ...params,
                subAcntNo,
                rqId: uuidv4(),
            });

            if (!response?.data?.data) {
                throw new Error(`Invalid response structure for subAccount: ${subAcntNo}`);
            }

            const realAsst = this.safeNumber(response.data.data.realAsst);
            const cash = this.safeNumber(response.data.data.cash) - this.safeNumber(response.data.data.cashDiv);

            return {
                account: this.formatWithCommas(realAsst),
                percent: this.calculatePercentage(realAsst, baseRealAsst),
                cash: cash,
            };
        } catch (error) {
            console.error(`Error processing account data for ${subAcntNo}:`, error);
            return {
                account: DEFAULT_ZERO_VALUE,
                percent: DEFAULT_ZERO_VALUE,
                cash: DEFAULT_ZERO_VALUE,
            };
        }
    }

    /**
     * Process position data for a specific sub-account (with error handling)
     */
    static async processPositionData(
        positionsApi: PositionsApi,
        params: BaseApiParams,
        subAcntNo: string
    ): Promise<PositionResult> {
        try {
            const response = await positionsApi.getPositionsAll({
                ...params,
                subAcntNo,
                rqId: uuidv4(),
                getBondQty: "Y",
                AorN: "S",
            });

            if (!response?.data?.data || !Array.isArray(response.data.data)) {
                throw new Error(`Invalid response structure for positions: ${subAcntNo}`);
            }

            if (response.data.data.length > 0) {
                const totalPosition = response.data.data.find((position: any) => position.symbol === "TOTAL");
                if (totalPosition) {
                    return {
                        gainLoss: this.formatWithCommas(totalPosition.gainLoss),
                        percentGainLoss: this.formatPercentage(this.safeNumber(totalPosition.gainLossPc)),
                    };
                }
            }

            console.log(`No total position found for subAccount: ${subAcntNo}`);
            return {
                gainLoss: DEFAULT_ZERO_VALUE,
                percentGainLoss: DEFAULT_ZERO_VALUE
            };
        } catch (error) {
            console.error(`Error processing position data for ${subAcntNo}:`, error);
            return {
                gainLoss: DEFAULT_ZERO_VALUE,
                percentGainLoss: DEFAULT_ZERO_VALUE
            };
        }
    }


    /**
     * Get hold stock data for a specific sub-account (with error handling and optimization)
     */
    static async getHoldStockData(
        positionsApi: PositionsApi,
        params: BaseApiParams,
        subAcntNo: string
    ): Promise<HoldStockResult[]> {
        try {
            const response = await positionsApi.getPositionsAll({
                ...params,
                subAcntNo,
                rqId: uuidv4(),
                getBondQty: "Y",
                AorN: "S",
            });

            if (!response?.data?.data || !Array.isArray(response.data.data)) {
                throw new Error(`Invalid response structure for hold stock: ${subAcntNo}`);
            }

            if (response.data.data.length > 0) {
                return response.data.data.map((position: any) => ({
                    symbol: position.symbol || 'Unknown',
                    marketValue: this.formatWithCommas(position.totCurAmt),
                    capitalValue: this.formatWithCommas(position.totBuyAmt),
                    qty: this.formatWithCommas(position.balQty),
                    capitalPrice: this.formatPercentage(this.safeNumber(position.avgPrice)),
                    gainLoss: this.formatWithCommas(position.gainLoss),
                    percentGainLoss: this.formatPercentage(this.safeNumber(position.gainLossPc)),
                }));
            }

            console.log(`No hold stock data found for subAccount: ${subAcntNo}`);
            return [];
        } catch (error) {
            console.error(`Error getting hold stock data for ${subAcntNo}:`, error);
            return [];
        }
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
     * Build card data structures for reporting (optimized with validation)
     */
    static buildOverviewData(result: any) {
        // Helper function to safely extract values
        const safeExtract = (key: string, defaultValue: string = DEFAULT_ZERO_VALUE) =>
            result[key] ?? defaultValue;

        return {
            card1: {
                nav: safeExtract('nav'),
                gainLoss: safeExtract('gainLoss'),
                percentGainLoss: safeExtract('percentGainLoss'),
                widthdrawable: safeExtract('widthdrawable'),
            },
            card2Data: {
                normalAccount: safeExtract('normalAccount'),
                gainLossNormal: safeExtract('gainLossNormal'),
                percentGainLossNormal: safeExtract('percentGainLossNormal'),
                marginAccount: safeExtract('marginAccount'),
                gainLossMargin: safeExtract('gainLossMargin'),
                percentGainLossMargin: safeExtract('percentGainLossMargin'),
                derivativeAccount: safeExtract('derivativeAccount'),
                gainLossDerivative: safeExtract('gainLossDerivative'),
                percentGainLossDerivative: safeExtract('percentGainLossDerivative'),
                folioAccount: safeExtract('folioAccount'),
                gainLossFolio: safeExtract('gainLossFolio'),
                percentGainLossFolio: safeExtract('percentGainLossFolio'),
            },
            card2Chart: {
                nav: safeExtract('nav'),
                normalAccount: safeExtract('normalAccount'),
                percentNormalAccount: safeExtract('percentNormalAccount'),
                marginAccount: safeExtract('marginAccount'),
                percentMarginAccount: safeExtract('percentMarginAccount'),
                derivativeAccount: safeExtract('derivativeAccount'),
                percentDerivativeAccount: safeExtract('percentDerivativeAccount'),
                folioAccount: safeExtract('folioAccount'),
                percentFolioAccount: safeExtract('percentFolioAccount'),
            },
            card3Asset: {
                totalAsset: safeExtract('totalAsset'),
                cash: safeExtract('cash'),
                percentCash: safeExtract('percentCash'),
                stock: safeExtract('stock'),
                percentStock: safeExtract('percentStock'),
                dividend: safeExtract('dividend'),
                percentDividend: safeExtract('percentDividend'),
                PineB: safeExtract('PineB'),
                percentPineB: safeExtract('percentPineB'),
                drvtVsdAmt: safeExtract('drvtVsdAmt'),
                percentDrvtVsdAmt: safeExtract('percentDrvtVsdAmt'),
            },
            card3Debt: {
                debt: safeExtract('debt'),
                fee: safeExtract('fee'),
                percentFee: safeExtract('percentFee'),
                marginDebt: safeExtract('marginDebt'),
                percentMarginDebt: safeExtract('percentMarginDebt'),
            }
        };
    }


    static buildNormalAccountData(result: any) {
        // Helper function to safely extract values
        const safeExtract = (key: string, defaultValue: string = DEFAULT_ZERO_VALUE) =>
            result[key] ?? defaultValue;

        return {
            card1: {
                navNormal: safeExtract('navNormal'),
                gainLossNormal: safeExtract('gainLossNormal'),
                percentGainLossNormal: safeExtract('percentGainLossNormal'),
                widthdrawableNormal: safeExtract('widthdrawableNormal'),
            },
            cardCashData: {
                totalAssetNormal: safeExtract('totalAssetNormal'),
                cashNormal: safeExtract('cashNormal'),
                percentCash: safeExtract('percentCash'),
                balance: safeExtract('balance'),
                advanceAvail: safeExtract('advanceAvail'),
                maxAdvanceAvail: safeExtract('maxAdvanceAvail'),
                haveAdvanceAvail: safeExtract('haveAdvanceAvail'),
                dividendAndProfitBond: safeExtract('dividendAndProfitBond'),
                totalBuyWaitMatch: safeExtract('totalBuyWaitMatch'),
                buyWaitMatchByCash: safeExtract('buyWaitMatchByCash'),
                buyWaitMatchByLoan: safeExtract('buyWaitMatchByLoan'),
                cashBuyNotMatchT0: safeExtract('cashBuyNotMatchT0'),
                cashTichLuy: safeExtract('cashTichLuy'),
                taxFeePSWaitT0: safeExtract('taxFeePSWaitT0'),
            },
            cardStockData: {
                stockNormal: safeExtract('stockNormal'),
                percentStock: safeExtract('percentStock'),
                totalValueStock: safeExtract('totalValueStock'),
                availableStock: safeExtract('availableStock'),
                waitTradingStock: safeExtract('waitTradingStock'),
                retrictStock: safeExtract('retrictStock'),
                restrictStockWaitTrading: safeExtract('restrictStockWaitTrading'),
                dividendStock: safeExtract('dividendStock'),
                stockBuyWaitReturn: safeExtract('stockBuyWaitReturn'),
                sellMatchT0: safeExtract('sellMatchT0'),
            },
            cardPineBData: {
                pineB: safeExtract('pineB'),
                pineBPercent: safeExtract('pineBPercent'),
                originInvest: safeExtract('originInvest'),
                traiTucDaNhan: safeExtract('traiTucDaNhan'),
                traiTucSeNhan: safeExtract('traiTucSeNhan'),
                tienNhanDaoHan: safeExtract('tienNhanDaoHan'),
            },
            cardDebtData: {
                debtNormal: safeExtract('debtNormal'),
                feeSMS: safeExtract('feeSMS'),
                percentFeeSMS: safeExtract('percentFeeSMS'),
                feeVSD: safeExtract('feeVSD'),
                percentFeeVSD: safeExtract('percentFeeVSD'),
            },

            cardHoldStockData: safeExtract('holdStock'),
        }
    }

    static buildMarginAccountData(result: any) {
        // Helper function to safely extract values
        const safeExtract = (key: string, defaultValue: string = DEFAULT_ZERO_VALUE) =>
            result[key] ?? defaultValue;
        return {
            card1: {
                navMargin: safeExtract('navMargin'),
                gainLossMargin: safeExtract('gainLossMargin'),
                percentGainLossMargin: safeExtract('percentGainLossMargin'),
                widthdrawableMargin: safeExtract('widthdrawableMargin'),
                rtt: safeExtract('rtt'),
            },
            cardCashData: {
                totalAssetMargin: safeExtract('totalAssetMargin'),
                cashMargin: safeExtract('cashMargin'),
                percentCash: safeExtract('percentCash'),
                balance: safeExtract('balance'),
                advanceAvail: safeExtract('advanceAvail'),
                maxAdvanceAvail: safeExtract('maxAdvanceAvail'),
                haveAdvanceAvail: safeExtract('haveAdvanceAvail'),
                dividendAndProfitBond: safeExtract('dividendAndProfitBond'),
                totalBuyWaitMatch: safeExtract('totalBuyWaitMatch'),
                buyWaitMatchByCash: safeExtract('buyWaitMatchByCash'),
                buyWaitMatchByLoan: safeExtract('buyWaitMatchByLoan'),
                cashBuyNotMatchT0: safeExtract('cashBuyNotMatchT0'),
                cashTichLuy: safeExtract('cashTichLuy'),
                taxFeePSWaitT0: safeExtract('taxFeePSWaitT0'),
            },
            cardStockData: {
                stockMargin: safeExtract('stockMargin'),
                percentStock: safeExtract('percentStock'),
                totalValueStock: safeExtract('totalValueStock'),
                availableStock: safeExtract('availableStock'),
                waitTradingStock: safeExtract('waitTradingStock'),
                retrictStock: safeExtract('retrictStock'),
                restrictStockWaitTrading: safeExtract('restrictStockWaitTrading'),
                dividendStock: safeExtract('dividendStock'),
                stockBuyWaitReturn: safeExtract('stockBuyWaitReturn'),
                sellMatchT0: safeExtract('sellMatchT0'),
            },
            cardDebtData: {
                totalDebtMargin: safeExtract('totalDebtMargin'),
                totalMargin: safeExtract('totalMargin'),
                percentTotalMargin: safeExtract('percentTotalMargin'),
                originMargin: safeExtract('originMargin'),
                interestMargin: safeExtract('interestMargin'),

                totalFeeTrading: safeExtract('totalFeeTrading'),
                percentTotalFeeTrading: safeExtract('percentTotalFeeTrading'),
                feeSMS: safeExtract('feeSMS'),
                feeVSD: safeExtract('feeVSD'),

                expectedDisbursement: safeExtract('expectedDisbursement'),
                percentExpectedDisbursement: safeExtract('percentExpectedDisbursement'),
            },
            cardHoldStockData: safeExtract('holdStock'),
        }
    }

    static buildFolioAccountData(result: any) {
        // Helper function to safely extract values
        const safeExtract = (key: string, defaultValue: string = DEFAULT_ZERO_VALUE) =>
            result[key] ?? defaultValue;
        return {
            card1: {
                navFolio: safeExtract('navFolio'),
                gainLossFolio: safeExtract('gainLossFolio'),
                percentGainLossFolio: safeExtract('percentGainLossFolio'),
                widthdrawableFolio: safeExtract('widthdrawableFolio'),
            },
            cardCashData: {
                totalAssetFolio: safeExtract('totalAssetFolio'),
                cashFolio: safeExtract('cashFolio'),
                percentCash: safeExtract('percentCash'),
                balance: safeExtract('balance'),
                advanceAvail: safeExtract('advanceAvail'),
                maxAdvanceAvail: safeExtract('maxAdvanceAvail'),
                haveAdvanceAvail: safeExtract('haveAdvanceAvail'),
                dividendAndProfitBond: safeExtract('dividendAndProfitBond'),
                totalBuyWaitMatch: safeExtract('totalBuyWaitMatch'),
                buyWaitMatchByCash: safeExtract('buyWaitMatchByCash'),
                buyWaitMatchByLoan: safeExtract('buyWaitMatchByLoan'),
                cashBuyNotMatchT0: safeExtract('cashBuyNotMatchT0'),
                cashTichLuy: safeExtract('cashTichLuy'),
                taxFeePSWaitT0: safeExtract('taxFeePSWaitT0'),
            },
            cardStockData: {
                stockFolio: safeExtract('stockFolio'),
                percentStock: safeExtract('percentStock'),
                totalValueStock: safeExtract('totalValueStock'),
                availableStock: safeExtract('availableStock'),
                waitTradingStock: safeExtract('waitTradingStock'),
                retrictStock: safeExtract('retrictStock'),
                restrictStockWaitTrading: safeExtract('restrictStockWaitTrading'),
                dividendStock: safeExtract('dividendStock'),
                stockBuyWaitReturn: safeExtract('stockBuyWaitReturn'),
                sellMatchT0: safeExtract('sellMatchT0'),
            },
            cardDebtData: {
                debtFolio: safeExtract('debtFolio'),
                feeSMS: safeExtract('feeSMS'),
                percentFeeSMS: safeExtract('percentFeeSMS'),
                feeVSD: safeExtract('feeVSD'),
                percentFeeVSD: safeExtract('percentFeeVSD'),
            },
            cardHoldStockData: safeExtract('holdStock'),
        }
    }

    /**
     * Log card data in a formatted way (optimized with better formatting)
     */
    static logOverviewData(cardData: any): void {
        if (!cardData) {
            console.warn('No card data provided for logging');
            return;
        }

        const separator = "=".repeat(50);
        const subSeparator = "-".repeat(30);

        console.log(`\n${separator}`);
        console.log('📊 CARD DATA SUMMARY');
        console.log(separator);

        if (cardData.card1) {
            console.log('\n💰 CARD 1 - Overview:');
            console.log(subSeparator);
            console.log(JSON.stringify(cardData.card1, null, 2));
        }

        if (cardData.card2Data) {
            console.log('\n📈 CARD 2 - Account Data:');
            console.log(subSeparator);
            console.log(JSON.stringify(cardData.card2Data, null, 2));
        }

        if (cardData.card2Chart) {
            console.log('\n📊 CARD 2 - Chart Data:');
            console.log(subSeparator);
            console.log(JSON.stringify(cardData.card2Chart, null, 2));
        }

        if (cardData.card3Asset) {
            console.log('\n🏦 CARD 3 - Asset Data:');
            console.log(subSeparator);
            console.log(JSON.stringify(cardData.card3Asset, null, 2));
        }

        if (cardData.card3Debt) {
            console.log('\n💳 CARD 3 - Debt Data:');
            console.log(subSeparator);
            console.log(JSON.stringify(cardData.card3Debt, null, 2));
        }

        console.log(`\n${separator}\n`);
    }

    static logNormalAccountData(cardData: any): void {
        console.log(cardData.card1);
        console.log("--------------------------------");
        console.log(cardData.cardCashData);
        console.log("--------------------------------");
        console.log(cardData.cardStockData);
        console.log("--------------------------------");
        console.log(cardData.cardPineBData);
        console.log("--------------------------------");
        console.log(cardData.cardDebtData);
    }

    static logMarginAccountData(cardData: any): void {
        console.log(cardData.card1);
        console.log("--------------------------------");
        console.log(cardData.cardCashData);
        console.log("--------------------------------");
        console.log(cardData.cardStockData);
        console.log("--------------------------------");
        console.log(cardData.cardDebtData);
    }

    static logFollioAccountData(cardData: any): void {
        console.log(cardData.card1);
        console.log("--------------------------------");
        console.log(cardData.cardCashData);
        console.log("--------------------------------");
        console.log(cardData.cardStockData);
        console.log("--------------------------------");
        console.log(cardData.cardDebtData);
    }
}


