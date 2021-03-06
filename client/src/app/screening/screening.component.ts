import { Component, OnInit } from "@angular/core";
import { ScreeningService } from "../services/screening.service";
import { Router, ActivatedRoute } from "@angular/router";
import { Time } from "@angular/common";
import { BookingService } from "../services/booking.service";

@Component({
  selector: "app-screening",
  templateUrl: "./screening.component.html",
  styleUrls: ["./screening.component.scss"]
})
export class ScreeningComponent implements OnInit {
  theatreId: number;
  movieId: number;
  screeningId: number;
  screening = new Map<Date, Array<mappedScreening>>();
  date: Date;

  constructor(
    private screeningService: ScreeningService,
    private _router: Router,
    private route: ActivatedRoute,
    private bookingService: BookingService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.theatreId = params["id"];
      this.movieId = params["movieId"];
      this.screeningId = params["screeningId"];
      this.screeningService.test(this.movieId).subscribe(data => {
        data.responseBody.forEach(test => {
          console.log(test);
          if (this.screening.has(test.time.split(" ")[0])) {
            let blet = this.screening.get(test.time.split(" ")[0]);
            let newMappedScreening = {
              time: test.time.split(" ")[1],
              id: test.Id
            };
            blet.push(newMappedScreening);
            this.screening.set(test.time.split(" ")[0], blet);
          } else {
            let arr = new Array<mappedScreening>();
            let newMappedScreening = {
              time: test.time.split(" ")[1],
              id: test.Id
            };
            arr.push(newMappedScreening);
            this.screening.set(test.time.split(" ")[0], arr);
          }
        });
        console.log(this.screening);
      });
    });
  }

  test(id) {
    this._router.navigate(["/seats/"], {
      queryParams: {
        id: this.theatreId,
        movieId: this.movieId,
        screeningId: id
      }
    });
  }

  setMovieDateTime(date, time) {
    this.bookingService.updateBookingDetail("movieTime", time);
    this.bookingService.updateBookingDetail("movieDate", date);
    this.bookingService.updateBookingDetail("screeningId", this.screeningId);
  }
}

export interface mappedScreening {
  time: Time;
  id: number;
}
