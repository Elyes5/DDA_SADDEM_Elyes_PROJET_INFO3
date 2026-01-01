import type { Review } from "../models/Review"

export default interface ReviewResponse {
  message: string
  review: Review   
}