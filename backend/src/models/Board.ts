import mongoose, { Document, Schema } from 'mongoose';

export interface IBoard extends Document {
  title: string;
  description?: string;
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  lists: mongoose.Types.ObjectId[];
  background?: string;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const boardSchema = new Schema<IBoard>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  lists: [{
    type: Schema.Types.ObjectId,
    ref: 'List'
  }],
  background: {
    type: String
  },
  isPrivate: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export const Board = mongoose.model<IBoard>('Board', boardSchema);
