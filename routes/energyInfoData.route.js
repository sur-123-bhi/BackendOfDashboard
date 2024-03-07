const express = require("express");
const { DataModel } = require("../models/data.model.js");

const energyInfoDataRoute = express.Router();

energyInfoDataRoute.get("/", async (req, res) => {
  const { sector } = req.query;
  if(sector !== ''){
    try {
      const data = await DataModel.aggregate([
        { $match: { sector: `${sector}` } },
        { $match: { country: { $ne: "" } } },
        { $group: { _id: "$country" } },
      ]);
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
});

energyInfoDataRoute.get("/countryfilterd", async (req, res) => {
  const { sector, country } = req.query;
  try {
    const data = await DataModel.aggregate([
      { $match: { sector: sector } }, // Match documents based on sector
      { $match: { country: country } },
       // Exclude documents where country is an empty string
      {
        $group: {
          _id: "$country",
          avgRelevance: {
            $avg: "$relevance",
          },
          avgIntensity: {
            $avg: "$intensity",
          },
          avgLikelihood: {
            $avg: "$likelihood",
          },
        },
      }
    ]);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

energyInfoDataRoute.get("/sector/group/intensity", async (req, res) => {
  try {
    const data = await DataModel.aggregate([
      { $match: { sector: { $ne: "" } } },
      { $group: { _id: "$sector", avgIntensity: { $avg: "$intensity" } } },
      { $sort: { _id: 1 } },
    ]);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

energyInfoDataRoute.get("/sector/group/relevance", async (req, res) => {
  try {
    const data = await DataModel.aggregate([
      { $match: { sector: { $ne: "" } } },
      { $group: { _id: "$sector", avgRelevance: { $avg: "$relevance" } } },
      { $sort: { _id: 1 } },
    ]);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

energyInfoDataRoute.get("/region/likelihood", async (req, res) => {
  try {
    const data = await DataModel.aggregate([
      { $match: { region: { $ne: "" } } },
      { $group: { _id: "$region", totalLikelihood: { $sum: "$likelihood" } } },
    ]);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

energyInfoDataRoute.get("/graphdata", async (req, res) => {
  try {
    const gasIntensityData = await DataModel.aggregate([
      {
        $match: {
          $and: [{ sector: "Energy" }, { topic: "gas" }],
        },
      },
      {
        $group: {
          _id: { year: "$end_year" },
          consumption: {
            $sum: { $cond: [{ $eq: ["$topic", "gas"] }, "$intensity", 0] },
          },
        },
      },
      {
        $match: {
          "_id.year": { $ne: "" }, // Filter out documents with empty year
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          consumption: 1,
        },
      },
      {
        $sort: { year: 1 },
      },
    ]);

    const oilIntensityData = await DataModel.aggregate([
      {
        $match: {
          $and: [{ sector: "Energy" }, { topic: "oil" }],
        },
      },
      {
        $group: {
          _id: { year: "$end_year" },
          consumption: {
            $sum: { $cond: [{ $eq: ["$topic", "oil"] }, "$intensity", 0] },
          },
        },
      },
      {
        $match: {
          "_id.year": { $ne: "" }, // Filter out documents with empty year
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          consumption: 1,
        },
      },
      {
        $sort: { year: 1 },
      },
    ]);

    const data = [
      { name: "Gas", color: "red", items: gasIntensityData },
      { name: "Oil", color: "blue", items: oilIntensityData },
    ];
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = { energyInfoDataRoute };
