import { Selector, t } from 'testcafe';
import BasePage from './BasePage';

class DashboardPage extends BasePage {
    charts: Selector;
    dateRangePicker: Selector;
    exportButton: Selector;
    refreshButton: Selector;
    reportTable: Selector;
    filterDropdown: Selector;

    constructor() {
        super();
        this.charts = Selector('.chart-container');
        this.dateRangePicker = Selector('#dateRange');
        this.exportButton = Selector('#exportData');
        this.refreshButton = Selector('#refreshData');
        this.reportTable = Selector('.report-table');
        this.filterDropdown = Selector('#filterOptions');
    }

    async selectDateRange(startDate: string, endDate: string) {
        await t.click(this.dateRangePicker)
              .typeText(Selector('.start-date'), startDate)
              .typeText(Selector('.end-date'), endDate)
              .click(Selector('.apply-range'));
    }

    async exportReport(format: 'pdf' | 'csv' | 'excel') {
        await t.click(this.exportButton)
              .click(Selector(`[data-format="${format}"]`));
    }

    async refreshData() {
        await t.click(this.refreshButton);
        await this.waitForPageLoad();
    }

    async filterBy(option: string) {
        await t.click(this.filterDropdown)
              .click(Selector(`.filter-option[data-value="${option}"]`));
    }

    async getReportRowCount(): Promise<number> {
        return await this.reportTable.find('tbody tr').count;
    }
}

export default new DashboardPage(); 