import "dotenv/config";
import mongoose from "mongoose";
import Quiz from "../models/quiz.model.js";
import { connectDatabase } from "../config/database.js";
const q = (text, options, correctAnswerIndex, points = 10) => ({
  text,
  options,
  correctAnswerIndex,
  points,
});
const quizzes = [
  [
    "Technology Fundamentals",
    "Technology",
    "Core concepts in computing, software, and digital systems",
    [
      q(
        "What does CPU stand for?",
        [
          "Central Processing Unit",
          "Computer Personal Unit",
          "Central Program Utility",
          "Core Processing User",
        ],
        0,
      ),
      q(
        "Which language styles web pages?",
        ["HTML", "CSS", "SQL", "Python"],
        1,
      ),
      q(
        "Who created the Linux kernel?",
        ["Bill Gates", "Linus Torvalds", "Tim Berners-Lee", "Steve Wozniak"],
        1,
      ),
      q(
        "What is HTTPS designed to provide?",
        ["Compression", "Encryption", "Storage", "Graphics"],
        1,
      ),
      q(
        "Which is a version control system?",
        ["Git", "Figma", "Excel", "Docker Hub"],
        0,
      ),
    ],
  ],
  [
    "World Geography",
    "Geography",
    "Countries, capitals, physical geography, and global landmarks",
    [
      q(
        "What is the capital of Japan?",
        ["Seoul", "Kyoto", "Tokyo", "Osaka"],
        2,
      ),
      q(
        "Which is the largest ocean?",
        ["Atlantic", "Indian", "Arctic", "Pacific"],
        3,
      ),
      q(
        "The Nile flows into which sea?",
        ["Red Sea", "Mediterranean Sea", "Black Sea", "Arabian Sea"],
        1,
      ),
      q(
        "Mount Kilimanjaro is in which country?",
        ["Kenya", "Tanzania", "Ethiopia", "Uganda"],
        1,
      ),
      q(
        "Which continent has the most countries?",
        ["Asia", "Africa", "Europe", "South America"],
        1,
      ),
    ],
  ],
  [
    "World History",
    "History",
    "Major civilizations, historical events, and influential figures",
    [
      q(
        "The Renaissance began in which country?",
        ["France", "Italy", "Spain", "Greece"],
        1,
      ),
      q(
        "In which year did World War II end?",
        ["1943", "1944", "1945", "1946"],
        2,
      ),
      q(
        "Who was the first Roman emperor?",
        ["Julius Caesar", "Augustus", "Nero", "Trajan"],
        1,
      ),
      q("The Magna Carta was signed in?", ["1066", "1215", "1492", "1776"], 1),
      q(
        "Machu Picchu was built by which civilization?",
        ["Maya", "Aztec", "Inca", "Roman"],
        2,
      ),
    ],
  ],
  [
    "General Science",
    "Science",
    "Fundamentals of physics, biology, chemistry, and astronomy",
    [
      q("What is the chemical symbol for gold?", ["Ag", "Au", "Gd", "Go"], 1),
      q(
        "What planet is known as the Red Planet?",
        ["Venus", "Mars", "Jupiter", "Mercury"],
        1,
      ),
      q(
        "What gas do plants absorb?",
        ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"],
        2,
      ),
      q(
        "What is the largest human organ?",
        ["Heart", "Liver", "Skin", "Lungs"],
        2,
      ),
      q(
        "How many bones are in an adult human body?",
        ["186", "206", "226", "246"],
        1,
      ),
    ],
  ],
  [
    "Film and Cinema",
    "Movies",
    "Directors, productions, characters, and notable films",
    [
      q(
        "Who directed Jurassic Park?",
        ["James Cameron", "Steven Spielberg", "George Lucas", "Ridley Scott"],
        1,
      ),
      q(
        "Which film features Wakanda?",
        ["Black Panther", "Avatar", "Dune", "Aquaman"],
        0,
      ),
      q(
        "The One Ring appears in which series?",
        ["Star Wars", "Harry Potter", "The Lord of the Rings", "Narnia"],
        2,
      ),
      q(
        "Who played Jack in Titanic?",
        ["Brad Pitt", "Leonardo DiCaprio", "Matt Damon", "Tom Cruise"],
        1,
      ),
      q(
        "Which studio created Toy Story?",
        ["DreamWorks", "Pixar", "Ghibli", "Aardman"],
        1,
      ),
    ],
  ],
  [
    "Music",
    "Music",
    "Instruments, composers, terminology, and musical history",
    [
      q(
        "How many keys does a standard piano have?",
        ["66", "72", "88", "96"],
        2,
      ),
      q(
        "Which family does the violin belong to?",
        ["Brass", "Woodwind", "String", "Percussion"],
        2,
      ),
      q(
        "Who composed The Four Seasons?",
        ["Mozart", "Vivaldi", "Bach", "Beethoven"],
        1,
      ),
      q(
        "Jazz originated in which US city?",
        ["Chicago", "New York", "New Orleans", "Boston"],
        2,
      ),
      q(
        "What does tempo describe?",
        ["Volume", "Speed", "Pitch", "Harmony"],
        1,
      ),
    ],
  ],
  [
    "Literature",
    "Literature",
    "Authors, characters, novels, and significant literary works",
    [
      q(
        "Who wrote Pride and Prejudice?",
        ["Jane Austen", "Emily Bronte", "George Eliot", "Virginia Woolf"],
        0,
      ),
      q(
        "Sherlock Holmes was created by?",
        [
          "Agatha Christie",
          "Arthur Conan Doyle",
          "Edgar Allan Poe",
          "Charles Dickens",
        ],
        1,
      ),
      q(
        "Which novel begins with Ishmael as narrator?",
        ["Moby-Dick", "The Odyssey", "Dracula", "The Great Gatsby"],
        0,
      ),
      q(
        "Who wrote 1984?",
        ["Aldous Huxley", "George Orwell", "Ray Bradbury", "H. G. Wells"],
        1,
      ),
      q(
        "Hamlet is a prince of which country?",
        ["Norway", "England", "Denmark", "Sweden"],
        2,
      ),
    ],
  ],
  [
    "Sports",
    "Sports",
    "Rules, records, competitions, and international sporting events",
    [
      q(
        "How many players are on a soccer team on the field?",
        ["9", "10", "11", "12"],
        2,
      ),
      q(
        "Wimbledon is associated with which sport?",
        ["Golf", "Tennis", "Cricket", "Rugby"],
        1,
      ),
      q("How many rings are on the Olympic flag?", ["4", "5", "6", "7"], 1),
      q(
        "A slam dunk belongs to which sport?",
        ["Volleyball", "Basketball", "Baseball", "Handball"],
        1,
      ),
      q(
        "What is the maximum break in snooker?",
        ["127", "137", "147", "157"],
        2,
      ),
    ],
  ],
  [
    "General Knowledge",
    "General knowledge",
    "A broad selection of practical and cultural knowledge",
    [
      q("How many days are in a leap year?", ["364", "365", "366", "367"], 2),
      q(
        "Which animal is known as the ship of the desert?",
        ["Horse", "Camel", "Llama", "Elephant"],
        1,
      ),
      q(
        "What is the currency of Switzerland?",
        ["Euro", "Franc", "Krone", "Pound"],
        1,
      ),
      q(
        "Which color is made by mixing blue and yellow?",
        ["Purple", "Orange", "Green", "Brown"],
        2,
      ),
      q("How many sides does a hexagon have?", ["5", "6", "7", "8"], 1),
    ],
  ],
  [
    "Mathematics",
    "Mathematics",
    "Arithmetic, geometry, percentages, and number theory",
    [
      q("What is 12 multiplied by 8?", ["86", "94", "96", "108"], 2),
      q("What is the square root of 144?", ["10", "11", "12", "14"], 2),
      q(
        "A triangle's interior angles total?",
        ["90 degrees", "180 degrees", "270 degrees", "360 degrees"],
        1,
      ),
      q("Which number is prime?", ["21", "27", "29", "33"], 2),
      q("What is 25% of 80?", ["15", "20", "25", "30"], 1),
    ],
  ],
].map(([title, topic, description, questions]) => ({
  title,
  topic,
  description,
  questions,
}));
try {
  await connectDatabase();
  await Promise.all(
    quizzes.map((quiz) =>
      Quiz.findOneAndUpdate(
        { topic: quiz.topic },
        { $set: quiz },
        { upsert: true, new: true, runValidators: true },
      ),
    ),
  );
  const count = await Quiz.countDocuments({
    topic: { $in: quizzes.map((quiz) => quiz.topic) },
  });
  console.log(`Seed complete: ${count} quizzes available.`);
} catch (error) {
  console.error("Seed failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
