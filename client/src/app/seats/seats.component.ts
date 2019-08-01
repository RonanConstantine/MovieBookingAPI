import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { SeatModel } from "../models/seat.model";
import { SeatReservationModel } from "../models/seatReservation.model";
import { CinemaService } from "../services/cinema.service";

@Component({
  selector: "app-seats",
  templateUrl: "./seats.component.html",
  styleUrls: ["./seats.component.scss"]
})
export class SeatsComponent implements OnInit {
  cinema: Array<any>;
  movieId: number;
  theatreId: number;

  allSeats: Array<SeatModel>;
  seats: Array<SeatModel>;
  availableSeats: Array<SeatModel>;
  occupiedSeats: Array<SeatReservationModel>;
  selectedSeats: Array<SeatModel>;

  seatsLayout: Array<Array<SeatModel>>;

  constructor(
    private cinemaService: CinemaService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.selectedSeats = [];

    this.route.queryParams.subscribe(params => {
      this.theatreId = params["id"];
      this.movieId = params["movie"];
      this.availableSeats = new Array<SeatModel>();
      this.findSeats();
    });
  }

  findSeats() {
    this.cinemaService
      .getCinemaByIdAndMovie(this.theatreId, this.movieId)
      .subscribe(data => {
        this.cinema = data.responseBody;

        this.cinemaService
          .getSeatByCinema(this.cinema[0].cinema)
          .subscribe(data => {
            this.allSeats = data.responseBody;

            this.buildSeatsLayoutArray();
          });

        this.cinemaService
          .getOccupiedSeatByCinema(this.cinema[0].cinema)
          .subscribe(data => {
            this.occupiedSeats = data.responseBody;

            this.allSeats.forEach(a => {
              let isInArray = false;
              this.occupiedSeats.forEach(b => {
                if (a.Id === b.seat) {
                  isInArray = true;
                }
              });
              if (!isInArray) {
                this.availableSeats.push(a);
              }
            });
          });
      });
  }

  get getNumAvailableSeats() {
    if (this.availableSeats) {
      return this.availableSeats.length;
    }
  }

  get getTotalSeats() {
    if (this.allSeats) {
      return this.allSeats.length;
    }
  }

  get getTotalSelectedSeats() {
    if (this.selectedSeats) {
      return this.selectedSeats.length;
    }
  }

  get getTotalCost() {
    if (this.selectedSeats) {
      return this.selectedSeats.length * 100;
    }
  }

  buildSeatsLayoutArray() {
    let count = 1;
    this.seatsLayout = [];
    let row = [];
    for (let i = 1; i <= 5; i++) {
      row = [];
      for (let seat of this.allSeats) {
        if (seat.row == i) {
          row.push(seat);
        }
      }
      this.seatsLayout.push(row);
    }
    console.log(this.seatsLayout);
  }

  checkIfSeatIsSelected(id: Number): boolean {
    if (this.selectedSeats != undefined) {
      let seat = this.selectedSeats.find(e => e.Id === id);
      if (seat === undefined) {
        return false;
      } else {
        return true;
      }
    }
  }

  checkIfSeatIsOccupied(id: Number): boolean {
    if (this.occupiedSeats != undefined) {
      let seat = this.occupiedSeats.find(element => element.seat === id);
      if (seat === undefined) {
        return false;
      } else {
        return true;
      }
    }

    return false;
  }

  selectSeat(seat: SeatModel) {
    if (this.checkIfSeatIsSelected(seat.Id)) {
      let index = this.selectedSeats.indexOf(seat);
      this.selectedSeats.splice(index, 1);
    } else {
      if (!this.checkIfSeatIsOccupied(seat.Id)) {
        this.selectedSeats.push(seat);
      }
    }
  }
}
