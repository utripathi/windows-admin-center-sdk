import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import {
    LineChartComponent, LineChartData, LineChartType
} from '@msft-sme/angular';
import { AppContextService } from '@msft-sme/angular';
import { NavigationTitle } from '@msft-sme/angular';
import { Cim } from '@msft-sme/core/data/cim';
import { QueryCache } from '@msft-sme/core/data/query-cache';
import { ChartData, ChartPoint } from 'chart.js';
import { interval, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'sme-dev-guide-controls-line-chart',
    templateUrl: './line-chart-example.component.html'
})
@NavigationTitle({
    getTitle: () => 'Line Chart Component'
})
export class LineChartExampleComponent implements AfterViewInit, OnDestroy {
    @ViewChild('linechart1') public chart1: LineChartComponent;
    @ViewChild('linechart2') public chart2: LineChartComponent;
    @ViewChild('linechart3') public chart3: LineChartComponent;
    @ViewChild('linechart4') public chart4: LineChartComponent;
    public cpuChartSubscription: Subscription;
    public chartData: ChartData;
    public staticChartData: ChartData;
    public staticChartData2: ChartData;
    public staticChartData3: ChartData;
    public tabList1: string[] = [];
    public tabList2: string[] = [];
    public tabList3: string[] = [];
    public groupData: Map<string, LineChartData>[] = [];
    public groupData3: Map<string, LineChartData>[] = [];
    public lineChartData1: LineChartData;
    public lineChartData2: LineChartData;
    public lineChartData3: LineChartData;
    public lineChartData4: LineChartData;
    public lineChartData5: LineChartData;
    public cpuQueryCache = new QueryCache<any, any>(params => this.getProcessors(), params => '');
    public initialized = false;
    public clickedTab: number;
    public loadingMessage = 'loading...';
    public tooltipFormatters = [this.dummyFormatter1, this.dummyFormatter2];

    private tick = 0;

    constructor(private appContextService: AppContextService) {
        this.chartData = <ChartData>{
            labels: [],
            datasets: [
                {
                    label: 'CPU',
                    data: []
                }
            ]
        };

        this.staticChartData = <ChartData>{
            labels: [],
            datasets: [
                {
                    label: 'CPU',
                    data: []
                }
            ]
        };

        this.staticChartData2 = <ChartData>{
            labels: [],
            datasets: [
                {
                    label: 'Guest CPU',
                    data: []
                },
                {
                    label: 'Host CPU',
                    data: []
                }
            ]
        };

        this.staticChartData3 = <ChartData>{
            labels: [],
            datasets: [{
                label: 'Guest CPU',
                data: []
            },
            {
                label: 'Host CPU',
                data: []
            },
            {
                label: 'Total CPU',
                data: []
            }]
        };

        this.staticChartData.datasets[0].data = this.getStaticData();
        this.staticChartData2.datasets[0].data = this.getStaticData2();
        this.staticChartData2.datasets[1].data = this.getStaticData3();
        this.staticChartData3.datasets[0].data = this.getStaticData2();
        this.staticChartData3.datasets[1].data = this.getStaticData3();
        this.staticChartData3.datasets[2].data = this.getStaticData4();

        // add 60 labels to x axis
        for (let i = 60; i > 0; i--) {
            this.chartData.labels.push('');
            this.staticChartData.labels.push('');
            this.staticChartData2.labels.push('');
            this.staticChartData3.labels.push('');
        }

        // we know xAxisMaxLabel should be 60 seconds because 60 labels and update new data every 1 second
        this.lineChartData1 = {
            chartData: this.chartData,
            currentValueLabel: '10',
            unitLabel: 'GHz',
            xAxisMaxLabel: '60 seconds ago',
            xAxisMinLabel: 'Now',
            yAxisMaxLabel: '100%',
            yAxisMinLabel: '0',
            title: 'Loading',
            ymaxValue: 100,
            type: LineChartType.Historical,
            isLoading: true
        };

        this.lineChartData2 = {
            chartData: this.chartData,
            currentValueLabel: '7',
            unitLabel: 'GB',
            xAxisMaxLabel: '60s',
            xAxisMinLabel: '0',
            yAxisMaxLabel: '100 GB',
            yAxisMinLabel: '0',
            title: 'Custom Title',
            ymaxValue: 200,
            type: LineChartType.Scatter,
            isLoading: true
        };

        this.lineChartData3 = {
            chartData: this.staticChartData,
            currentValueLabel: '40',
            unitLabel: '%',
            xAxisMaxLabel: '60 seconds ago',
            xAxisMinLabel: 'Now',
            yAxisMaxLabel: '100%',
            yAxisMinLabel: '0',
            title: 'Static Data',
            isLoading: true
        };

        this.lineChartData4 = {
            chartData: this.staticChartData2,
            firstCurrentValueLabel: '1',
            secondCurrentValueLabel: '59',
            totalCurrentValueLabel: '60',
            firstLabel: 'Host',
            secondLabel: 'Guest',
            totalLabel: 'Total',
            unitLabel: 'GB',
            xAxisMaxLabel: '60 seconds ago',
            xAxisMinLabel: 'Now',
            yAxisMinLabel: '0',
            yAxisMaxLabel: '100 GB',
            ymaxValue: 100,
            title: 'Static Data 2'
        };

        this.lineChartData5 = {
            chartData: this.staticChartData3,
            firstCurrentValueLabel: '1',
            secondCurrentValueLabel: '59',
            totalCurrentValueLabel: '60',
            firstLabel: 'Host',
            secondLabel: 'Guest',
            totalLabel: 'Total',
            unitLabel: 'GB',
            xAxisMaxLabel: '60 seconds ago',
            xAxisMinLabel: 'Now',
            yAxisMinLabel: '0',
            yAxisMaxLabel: '100 GB',
            ymaxValue: 100,
            title: 'Static Data 3'
        };

        // this is the order the tabs will show up in
        this.tabList1 = ['Live', 'Hour', 'Day', 'Month', 'Year'];
        this.tabList2 = ['Live', 'Year'];
        this.tabList3 = ['Tab 0', 'Tab 1', 'Tab 2'];

        this.updateCpuChartData();
        interval(300)
        .pipe(map(() => {
            this.updateCpuChartData();
            this.chart1.refresh();
            this.updateCpuChartData();
            this.chart2.refresh();
        }))
        .subscribe();
        this.setTabGroupData();
    }

    public ngAfterViewInit(): void {
        this.initialized = true;
        this.mockAssyncDataLoading(0);
    }

    public ngOnDestroy(): void {
        if (this.cpuChartSubscription) {
            this.cpuChartSubscription.unsubscribe();
        }
    }

    private updateCpuChartData() {
        if (this.appContextService.connectionManager.activeConnection) {
            this.cpuChartSubscription = this.cpuQueryCache.createObservable().subscribe(response => {
                const newData: ChartPoint[] = [];
                const cpuUtilizationData = <number[]>response.value[0].properties.utilization;
                for (let i = cpuUtilizationData.length - 1; i >= 0; i--) {
                    newData.push({ x: -i, y: MsftSme.round(cpuUtilizationData[i], 2) });
                }

                // update existing data with new data and refresh charts
                this.chartData.datasets[0].data = newData;
                this.lineChartData1.currentValueLabel = '{0} GHz'.format(MsftSme.last(newData).y);
                this.lineChartData1.title = response.value[0].properties.name;
                this.lineChartData2.currentValueLabel = '{0} %'.format(MsftSme.last(newData).y);
                if (this.initialized) {
                    this.chart1.refresh();
                    this.chart2.refresh();
                    this.chart3.refresh();
                    this.chart4.refresh();
                }
            });

            this.cpuQueryCache.fetch({ interval: 1000, params: null });
        } else {
            this.staticChartData.datasets[0].data = this.getStaticData();
            this.lineChartData1.type = LineChartType.Line;
            this.lineChartData1.chartData = this.staticChartData;
            this.lineChartData2.type = LineChartType.Line;
            this.lineChartData2.chartData = this.staticChartData;
            this.lineChartData1.title = 'Sample Data';

            if (this.initialized) {
                this.chart1.refresh();
                this.chart2.refresh();
                this.chart3.refresh();
                this.chart4.refresh();
            }
        }
    }

    public getProcessors(): Observable<any> {
        return this.appContextService.cim.getInstanceMultiple(
            'localhost',
            Cim.namespace.managementTools2,
            Cim.cimClass.msftMTProcessorSummary);
    }

    public getStaticData(): number[] {
        const newData: number[] = [];
        for (let i = 0; i < 100; i++) {
            newData.push(50 * (Math.sin((i - this.tick) / 4) * Math.sin((i - this.tick) / 4)) + 10 * Math.random() + i - (this.tick % 100));
        }
        this.tick++;
        return newData;
    }

    public getStaticData2(): number[] {
        const newData: number[] = [];
        for (let i = 0; i < 60; i++) {
            newData.push(60 - i);
        }
        this.tick++;
        return newData;
    }

    public getStaticData3(): number[] {
        const newData: number[] = [];
        for (let i = 0; i < 60; i++) {
            newData.push(i);
        }
        this.tick++;
        return newData;
    }

    public getStaticData4(): number[] {
        const newData: number[] = [];
        for (let i = 0; i < 60; i++) {
            newData.push(60);
        }
        this.tick++;
        return newData;
    }

    public setTabGroupData() {
        // keys correspond to tabList. The key strings in the map must match the strings in the tabList
        // if a key in the tabList is left out in a set of group data,
        // the chart will not be rendered when that tab is selected
        const tabGroupData1 = new Map<string, LineChartData>();
        tabGroupData1.set('Live', this.lineChartData1);
        tabGroupData1.set('Hour', this.lineChartData2);
        tabGroupData1.set('Day', this.lineChartData3);
        tabGroupData1.set('Month', this.lineChartData2);
        tabGroupData1.set('Year', this.lineChartData3);

        const tabGroupData2 = new Map<string, LineChartData>();
        tabGroupData2.set('Live', this.lineChartData3);
        tabGroupData2.set('Hour', this.lineChartData1);
        tabGroupData2.set('Day', this.lineChartData2);
        tabGroupData2.set('Month', this.lineChartData3);
        tabGroupData2.set('Year', this.lineChartData1);

        this.groupData.push(tabGroupData1);
        this.groupData.push(tabGroupData2);
        this.groupData.push(tabGroupData1);
        this.groupData.push(tabGroupData2);
        this.groupData.push(tabGroupData1);

        const tabGroupData3 = new Map<string, LineChartData>();
        tabGroupData3.set('Tab 0', this.lineChartData1);
        tabGroupData3.set('Tab 1', this.lineChartData1);
        tabGroupData3.set('Tab 2', this.lineChartData1);

        const tabGroupData4 = new Map<string, LineChartData>();
        tabGroupData4.set('Tab 0', this.lineChartData3);
        tabGroupData4.set('Tab 1', this.lineChartData2);
        tabGroupData4.set('Tab 2', this.lineChartData2);

        this.groupData3.push(tabGroupData3);
        this.groupData3.push(tabGroupData4);

    }

    public mockAssyncDataLoading(tabIndex: number): void {
        const chartData0 = this.groupData3[0].get(`Tab {0}`.format(tabIndex));
        const chartData1 = this.groupData3[1].get(`Tab {0}`.format(tabIndex));
        chartData0.isLoading = true;
        chartData1.isLoading = true;
        // chart0 finishes "loading" first
        setTimeout(
            () => {
                chartData0.isLoading = false;
            },
            1000);
        setTimeout(
            () => {
                chartData1.isLoading = false;
            },
            1500);
    }

    public showClickedTab(tabPosition: number) {
        this.clickedTab = tabPosition;
    }

    public dummyFormatter1(input: number): string {
        return 'dummy formatted data value';
    }

    public dummyFormatter2(input: number): string {
        return `rounded: {0}`.format(MsftSme.round(input));
    }
}
