import { v4 as uuidv4 } from "uuid";
import BondListApi from "../page/api/BondListApi";
import BondCashFlowApi from "../page/api/BondCashFlowApi";
import BondPorfolioApi from "../page/api/BondPorfolioApi";
import BondDealApi from "../page/api/BondDealApi";
import BondOrderApi from "../page/api/BondOrderApi";

import BondIssuerListApi from "../page/api/getBondIssuerList";
import BondLmtValApi from "../page/api/getBondLmtVal";
import BondProRtApi from "../page/api/getBondProRt";
import BondTermsApi from "../page/api/getBondTerms";
import BondDetailApi from "../page/api/getBondDetail";
import { NumberValidator } from "./validationUtils";

// Constants for calculations and formatting
const DEFAULT_ZERO_VALUE = "0";
const PERCENTAGE_PRECISION = 2;
const PERCENTAGE_MULTIPLIER = 100;

// Type definitions for better type safety
export interface BondListData {
    bondCode: string; // mã trái phiếu
    issuerNm: string; // tổ chức phát hành
    issuesTypeNm: string; // hình thức phát hành (Public, Private)
    proInvtYN: string; // nhà đầu tư chuyên nghiệp
    productTp: string; // loại trái phiếu ( 1-Fix, 2-Flex, 3-Growth)
    guaranteeYN: string; // có bảo lãnh không
    termName: string; // thời hạn
    remainTenor: number; // tính từ ngày hiện tại đến đáo hạn (tháng)
    intRate: number; // lãi suất dự kiến
    leg1Prc: number; // giá mua trái phiếu
    leg2Prc: number; // giá bán trái phiếu
    selRemain: number; // KL có sẵn


    cpnrt: number; // Coupon hiện tại
    url: string; // url document bond
    freq: number; // tần suất coupon (1 time/year)
    parValue: number; // mệnh giá
    maxInvtQtyPerCust: number; // số lượng tối đa đầu tư cho mỗi khách hàng
    minInvtQtyPerOrdr: number; // số lượng tối thiểu đầu tư cho mỗi lệnh
    issudt: string; // ngày phát hành
    exprdt: string; // ngày đáo hạn
}

export interface BondDetailData {
    bondCode: string; // mã trái phiếu
    issuerNm: string; // tổ chức phát hành
    issuesTypeNm: string; // hình thức phát hành (Public, Private)
    proInvtYN: string; // nhà đầu tư chuyên nghiệp
    productTp: string; // loại trái phiếu ( 1-Fix, 2-Flex, 3-Growth)
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
     * Generate common account calculations
     */
    private static getBondInfo(data: BondListData): BondListData {
        return {
            bondCode: data.bondCode,
            issuerNm: data.issuerNm,
            issuesTypeNm: data.issuesTypeNm,
            proInvtYN: data.proInvtYN,
            productTp: data.productTp,
            guaranteeYN: data.guaranteeYN,
            termName: data.termName,
            remainTenor: data.remainTenor,
            intRate: data.intRate,
            leg1Prc: data.leg1Prc,
            leg2Prc: data.leg2Prc,
            selRemain: data.selRemain,

            cpnrt: data.cpnrt,
            url: data.url,
            freq: data.freq,
            parValue: data.parValue,
            maxInvtQtyPerCust: data.maxInvtQtyPerCust,
            minInvtQtyPerOrdr: data.minInvtQtyPerOrdr,
            issudt: data.issudt,
            exprdt: data.exprdt,
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
}


