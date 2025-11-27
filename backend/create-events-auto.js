require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Event');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

const events = [
  // COMPLETED EVENTS (Past dates - 2024)
  {"title":"Annual Sports Day 2024","description":"Join us for an exciting day of athletic competitions, team sports, and fun activities. Students from all grades will compete in track and field events, relay races, and team games. Prizes and medals will be awarded to winners!","category":"Sports","startDate":"2024-10-15T09:00:00","endDate":"2024-10-15T17:00:00","location":"Main Sports Ground","venue":"Athletic Stadium","capacity":500,"price":0,"isFeatured":true,"tags":"sports, athletics, competition, outdoor","status":"completed","registeredCount":450,"attendedCount":420},
  {"title":"Science Fair 2024","description":"Showcase your innovative science projects and experiments! Students will present their research, inventions, and discoveries. Judges will evaluate projects based on creativity, scientific method, and presentation. Open to all science enthusiasts!","category":"Academic","startDate":"2024-10-20T10:00:00","endDate":"2024-10-20T16:00:00","location":"Science Block","venue":"Main Hall, Building A","capacity":300,"price":0,"isFeatured":true,"tags":"science, innovation, research, exhibition","status":"completed","registeredCount":280,"attendedCount":265},
  {"title":"Cultural Festival - Harmony 2024","description":"Celebrate diversity through music, dance, and art! Experience performances from different cultures, traditional dances, live music, and art exhibitions. Food stalls featuring international cuisines will be available.","category":"Cultural","startDate":"2024-11-01T14:00:00","endDate":"2024-11-01T20:00:00","location":"Main Auditorium","venue":"Cultural Center","capacity":600,"price":5,"isFeatured":true,"tags":"culture, music, dance, diversity, festival","status":"completed","registeredCount":580,"attendedCount":550},
  {"title":"Inter-School Debate Championship","description":"Watch the best debaters compete on contemporary topics! Teams will debate on current affairs, social issues, and philosophical questions. Audience participation and Q&A session included.","category":"Debate","startDate":"2024-10-25T15:00:00","endDate":"2024-10-25T18:00:00","location":"Conference Hall","venue":"Building B, 3rd Floor","capacity":150,"price":0,"isFeatured":false,"tags":"debate, public speaking, competition, intellectual","status":"completed","registeredCount":140,"attendedCount":135},
  {"title":"Photography Workshop: Mastering DSLR","description":"Learn professional photography techniques from expert photographers. Topics include composition, lighting, camera settings, and post-processing. Bring your own camera. Limited seats available!","category":"Workshop","startDate":"2024-10-18T13:00:00","endDate":"2024-10-18T17:00:00","location":"Media Lab","venue":"Building C, Room 201","capacity":30,"price":15,"isFeatured":false,"tags":"photography, workshop, skills, creative","status":"completed","registeredCount":30,"attendedCount":28},
  
  // UPCOMING EVENTS (2026)
  {"title":"Art Exhibition: Student Masterpieces","description":"Explore stunning artworks created by talented students! The exhibition features paintings, sculptures, digital art, and mixed media installations. Meet the artists and learn about their creative process.","category":"Exhibition","startDate":"2026-03-05T11:00:00","endDate":"2026-03-07T18:00:00","location":"Art Gallery","venue":"Fine Arts Building","capacity":200,"price":0,"isFeatured":true,"tags":"art, exhibition, creativity, visual arts"},
  {"title":"Basketball Tournament Finals","description":"Witness the thrilling finals of our inter-house basketball tournament! The top two teams will compete for the championship trophy. Expect high-energy gameplay, amazing dunks, and nail-biting moments!","category":"Sports","startDate":"2026-02-22T16:00:00","endDate":"2026-02-22T19:00:00","location":"Indoor Sports Complex","venue":"Basketball Court 1","capacity":400,"price":0,"isFeatured":true,"tags":"basketball, sports, tournament, finals"},
  {"title":"Coding Bootcamp: Python for Beginners","description":"Start your programming journey with Python! This intensive workshop covers basics of Python programming, data structures, and simple projects. No prior coding experience required. Laptops mandatory.","category":"Workshop","startDate":"2026-02-28T09:00:00","endDate":"2026-02-28T15:00:00","location":"Computer Lab","venue":"IT Building, Lab 3","capacity":40,"price":20,"isFeatured":false,"tags":"coding, python, programming, technology, workshop"},
  {"title":"Music Concert: Battle of the Bands","description":"Rock out with student bands performing live! Five talented bands will compete for the title of Best School Band. Genres include rock, pop, indie, and fusion. Vote for your favorite band!","category":"Cultural","startDate":"2026-03-08T18:00:00","endDate":"2026-03-08T21:00:00","location":"Open Air Theater","venue":"Campus Grounds","capacity":800,"price":10,"isFeatured":true,"tags":"music, concert, bands, live performance, entertainment"},
  {"title":"Career Guidance Seminar","description":"Get expert advice on career planning and college admissions! Industry professionals and university representatives will share insights on various career paths, entrance exams, and scholarship opportunities.","category":"Academic","startDate":"2026-03-10T14:00:00","endDate":"2026-03-10T17:00:00","location":"Main Auditorium","venue":"Assembly Hall","capacity":500,"price":0,"isFeatured":false,"tags":"career, guidance, education, future planning"},
  {"title":"Environmental Awareness Drive","description":"Join us in making our campus greener! Activities include tree plantation, waste segregation workshop, eco-friendly craft making, and a documentary screening on climate change. Let's save our planet together!","category":"Social","startDate":"2026-03-12T10:00:00","endDate":"2026-03-12T14:00:00","location":"Campus Garden","venue":"Eco Park","capacity":250,"price":0,"isFeatured":false,"tags":"environment, sustainability, social, awareness, green"},
  {"title":"Drama Performance: Shakespeare's Hamlet","description":"Experience the timeless tragedy brought to life by our talented drama club! This classic tale of revenge, madness, and moral corruption will captivate audiences. Professional costumes and stage design included.","category":"Cultural","startDate":"2026-03-15T19:00:00","endDate":"2026-03-15T21:30:00","location":"Theater Hall","venue":"Performing Arts Center","capacity":350,"price":8,"isFeatured":true,"tags":"drama, theater, shakespeare, performance, arts"},
  {"title":"Robotics Competition: RoboWars","description":"Watch robots battle it out in the arena! Teams have built combat robots that will compete in elimination rounds. Witness engineering excellence, strategic gameplay, and exciting robot battles!","category":"Academic","startDate":"2026-03-18T13:00:00","endDate":"2026-03-18T18:00:00","location":"Engineering Lab","venue":"Robotics Arena, Building D","capacity":200,"price":5,"isFeatured":true,"tags":"robotics, technology, competition, engineering, innovation"},
  {"title":"Yoga and Meditation Workshop","description":"Find your inner peace and improve flexibility! Expert yoga instructors will guide you through various asanas, breathing techniques, and meditation practices. Suitable for all levels. Bring your own yoga mat.","category":"Workshop","startDate":"2026-03-20T07:00:00","endDate":"2026-03-20T09:00:00","location":"Wellness Center","venue":"Yoga Studio","capacity":50,"price":0,"isFeatured":false,"tags":"yoga, meditation, wellness, health, mindfulness"},
  {"title":"Food Festival: Taste of Nations","description":"Embark on a culinary journey around the world! Sample delicious dishes from various countries prepared by students and local chefs. Live cooking demonstrations, recipe sharing, and food competitions included!","category":"Cultural","startDate":"2026-03-22T12:00:00","endDate":"2026-03-22T20:00:00","location":"Campus Cafeteria","venue":"Food Court Area","capacity":600,"price":12,"isFeatured":true,"tags":"food, festival, international, cuisine, culture"},
  {"title":"Chess Championship","description":"Test your strategic thinking in our annual chess tournament! Players of all skill levels are welcome. Matches will be played in classical time control. Trophies for top 3 winners and certificates for all participants.","category":"Academic","startDate":"2026-03-25T09:00:00","endDate":"2026-03-25T17:00:00","location":"Library Hall","venue":"Reading Room 1","capacity":100,"price":0,"isFeatured":false,"tags":"chess, strategy, competition, intellectual, games"},
  {"title":"Fashion Show: Runway Revolution","description":"Witness creativity on the runway! Student designers showcase their original fashion collections featuring sustainable materials and innovative designs. Professional models, music, and lighting create an unforgettable experience.","category":"Exhibition","startDate":"2026-03-28T18:30:00","endDate":"2026-03-28T21:00:00","location":"Main Auditorium","venue":"Grand Hall","capacity":450,"price":15,"isFeatured":true,"tags":"fashion, design, runway, creativity, exhibition"},
  {"title":"Public Speaking Masterclass","description":"Overcome stage fright and become a confident speaker! Learn techniques for effective communication, body language, voice modulation, and audience engagement. Interactive sessions with practical exercises and personalized feedback.","category":"Workshop","startDate":"2026-04-01T14:00:00","endDate":"2026-04-01T17:00:00","location":"Seminar Hall","venue":"Building E, Room 305","capacity":60,"price":10,"isFeatured":false,"tags":"public speaking, communication, skills, workshop, confidence"},
  {"title":"Charity Run: Run for Education","description":"Run for a cause! Participate in our 5K charity run to raise funds for underprivileged children's education. All proceeds go to scholarship programs. T-shirts and refreshments provided. Family-friendly event!","category":"Social","startDate":"2026-04-05T06:00:00","endDate":"2026-04-05T09:00:00","location":"Campus Track","venue":"Starting Point: Main Gate","capacity":500,"price":5,"isFeatured":true,"tags":"charity, run, social, fitness, fundraising, education"},
  {"title":"Gaming Tournament: E-Sports Championship","description":"Compete in popular video games and win exciting prizes! Tournaments include FIFA, Valorant, and Mobile Legends. Solo and team competitions available. Gaming setups provided. Spectators welcome!","category":"Other","startDate":"2026-04-08T10:00:00","endDate":"2026-04-08T19:00:00","location":"Gaming Zone","venue":"Student Center, 2nd Floor","capacity":150,"price":8,"isFeatured":true,"tags":"gaming, esports, tournament, competition, entertainment"}
];

async function createEvents() {
  try {
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('❌ No admin found');
      process.exit(1);
    }
    console.log(`✅ Admin: ${admin.email}\n📋 Creating ${events.length} events (5 completed, 15 upcoming)...\n`);
    let created = 0, skipped = 0;
    for (const eventData of events) {
      const exists = await Event.findOne({ title: eventData.title });
      if (exists) {
        console.log(`⏭️  Skipped: "${eventData.title}"`);
        skipped++;
        continue;
      }
      await Event.create({
        ...eventData,
        organizer: admin._id,
        isPublished: true,
        status: eventData.status || 'upcoming',
        registeredCount: eventData.registeredCount || 0,
        attendedCount: eventData.attendedCount || 0,
        views: Math.floor(Math.random() * 150) + 50,
        targetAudience: ['students', 'teachers'],
        requiresRegistration: true,
        tags: eventData.tags.split(',').map(tag => tag.trim())
      });
      console.log(`✅ Created: "${eventData.title}" [${eventData.status || 'upcoming'}]`);
      created++;
    }
    console.log(`\n📊 Created: ${created} | Skipped: ${skipped}\n🎉 Done!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createEvents();
