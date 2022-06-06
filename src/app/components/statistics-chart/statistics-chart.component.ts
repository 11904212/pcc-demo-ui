import {Component, OnInit, ViewChild} from '@angular/core';
import {ChartData, ChartOptions} from "chart.js";
import {StatisticsService} from "../../services/statistics.service";
import {Stats} from "../../models/stats";
import {BaseChartDirective} from "ng2-charts";
import {formatDate} from "@angular/common";

@Component({
  selector: 'app-statistics-chart',
  templateUrl: './statistics-chart.component.html',
  styleUrls: ['./statistics-chart.component.scss']
})
export class StatisticsChartComponent implements OnInit {

  private labels: string[] = [];
  private dataAvg: number[] = [];
  private dataMin: number[] = [];
  private dataMax: number[] = [];
  readonly lineChartData: ChartData<'line'> = {
    labels: this.labels,
    datasets: [
      {
        label: 'avg',
        data: this.dataAvg,
        tension: 0,
      },
      {
        label: 'min',
        data: this.dataMin,
        tension: 0,
      },
      {
        label: 'max',
        data: this.dataMax,
        tension: 0,
      },
    ],
  };
  readonly chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'NDVI',
      },
    },
  };

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  constructor(
    private statisticsService: StatisticsService
  ) { }

  ngOnInit(): void {
    this.statisticsService.getStatistics().subscribe(
      stats => this.updateChart(stats)
    )
  }

  private updateChart(stats: Stats[]){
    const sortedStats = [...stats];
    this.labels.length = 0;
    this.dataAvg.length = 0;
    this.dataMin.length = 0;
    this.dataMax.length = 0;
    sortedStats.sort((a,b) => {
      return a.dateTime < b.dateTime ? -1: 1
    });
    sortedStats.forEach(stat => {
      const date = stat.dateTime;
      const formatedDate = formatDate(date, "yyyy-MM-dd", "en_US", "UTC");
      this.labels.push(formatedDate);
      this.dataAvg.push(stat.ndviAvg);
      this.dataMax.push(stat.ndviMax);
      this.dataMin.push(stat.ndviMin)
      }
    );

    this.chart?.update();
  }

}
