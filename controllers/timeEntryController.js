import TimeEntry from '../models/timeEntryModel.js'
import Project from '../models/projectModel.js'
import mongoose from 'mongoose'
import { Parser } from 'json2csv'
import PDFDocument from 'pdfkit'

//Create a new time entry
export const createTimeEntry = async (req, res) => {
  const { projectId, duration, description } = req.body

  if (!projectId || !duration || !description) {
    return res.status(400).json({ message: 'All fields are required' })
  }

  try {
    // Check if project exists and belongs to user
    const project = await Project.findOne({
      _id: projectId,
      author: req.userId
    })

    if (!project) {
      return res
        .status(404)
        .json({ message: 'Project not found or access denied' })
    }

    const timeEntry = new TimeEntry({
      project: projectId,
      user: req.userId,
      duration: duration,
      description: description
    })

    await timeEntry.save()
    res
      .status(201)
      .json({ message: 'Time entry created successfully', timeEntry })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

//Get all time Entries for logged in User
export const getTimeEntries = async (req, res) => {
  try {
    const entries = await TimeEntry.find({ user: req.userId }).populate('project','title')
    res.status(200).json(entries)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

//Summary: total duration per project for logged in user

export const getSummaryByProject = async (req, res) => {
  try {
    // console.log('req.userId:', req.userId)
   
    //console.log('TimeEntries:', timeEntries)

    const summary = await TimeEntry.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.userId) } }, //Filter time entries by the user's ID ($match stage).

      {
        $group: {
          _id: '$project', // Group time entries by project ID.
          totalDuration: { $sum: '$duration' }, // Calculate the total duration for each project.
          entries: { $push: '$$ROOT' } // Store the time entries for each project in an array.
        }
      },

      //Lookup project title from project collection
      {
        $lookup: {
          from: 'projects', // collection name (lowercase plural)
          localField: '_id', // project ObjectId in _id
          foreignField: '_id',
          as: 'projectInfo'
        }
      },

      //Unwind so projectInfo becomes a single object
      {
        $unwind: '$projectInfo'
      },

      //Projecr desired fields (rename _id to projectId, add project title)
      {
        $project: {
          _id: 0,
          projectId: '$_id',
          projectTitle: '$projectInfo.title',
          totalDuration: 1,

          //format entries with selected fields
          entries: {
            $map: {
              input: '$entries',
              as: 'entry',
              in: {
                _id: '$$entry._id',
                duration: '$$entry.duration',
                description: '$$entry.description',

                //format timestamp
                timestamp: {
                  $dateToString: {
                    format: '%Y-%m-%d %H:%M:%S',
                    date: '$$entry.timestamp',
                    timezone: 'Asia/Kolkata'
                  }
                }
              } 
            }
          }
        }
      }
    ])

    res.status(200).json(summary)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const timeEntriesToCSV = async (req, res) => {
  try {
    //console.log('req.user:', req.userId);
    // Get all entries for logged-in user, populate project title
    const entries = await TimeEntry.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.userId) } },

      //Lookup : fetch project title for each entry from project collection
      {
        $lookup: {
          from: 'projects',
          localField: 'project',
          foreignField: '_id',
          as: 'projectInfo'
        }
      },

      //Unwind so projectInfo becomes a single object
      { $unwind: '$projectInfo' },

      // Project desired fields (project title, duration, description, timestamp)
      {
        $project: {
          _id: 0,
          projectTitle: '$projectInfo.title',
          duration: 1,
          description: 1,
          timestamp: {
            $dateToString: {
              format: '%Y-%m-%d %H:%M',
              date: '$timestamp',
              timezone: 'Asia/Kolkata'
            }
          }
        }
      }
    ])

    // console.log(entries);
    if (entries.length === 0) {
      res.status(404).json({ message: 'No time entries found' })
      return
    }

    //convert JSON to CSV
    const parser = new Parser({
      fields: ["projectTitle", "duration", "description", "timestamp"],
      delimiter: ',',
      quote: '"',
      escape: '\\',
      header: true
    })
    const csv = parser.parse(entries)

    //set Response header
    res.header('Content-type', 'text/csv')
    res.attachment('time_entries.csv')
    return res.send(csv)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const timeEntriesToPDF = async (req, res) => {
  try {
    const summary = await TimeEntry.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.userId) } },

      {
        $group: {
          _id: '$project',
          totalDuration: { $sum: '$duration' }
        }
      },

      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: '_id',
          as: 'projectInfo'
        }
      },

      { $unwind: '$projectInfo' },

      {
        $project: {
          _id: 0,
          projectId: '$_id',
          projectTitle: '$projectInfo.title',
          totalDuration: 1
        }
      }
    ])

    //create PDF doc using pdfkitm library
    const doc = new PDFDocument()

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="time_summary.pdf"'
    )

    doc.pipe(res) // Pipe the PDF data to the response stream

    doc.fontSize(18).text('Time Entries Summary', { align: 'center' })
    doc.moveDown() // Add a line break

    summary.forEach(item => {
      doc.fontSize(14).text(`Project: ${item.projectTitle}`)
      doc.text(`Total Duration: ${item.totalDuration} hours`)
      doc.moveDown()
    })

    doc.end()
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
