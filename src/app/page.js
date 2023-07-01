"use client";
import Image from 'next/image'
import Head from 'next/head'
import {BiAdjust} from 'react-icons/bi'
import {BsDiscord, BsTwitter, BsYoutube, BsFacebook} from 'react-icons/bs'
import { useState, useEffect, useRef } from "react"
import {color, motion} from 'framer-motion'

function Card({imgPath, title, desc}){
  return (
    <div className=' text-center shadow-xl p-10 rounded-xl my-10 border-teal-500 hover:shadow-2xl transition-all duration-300 min-h-fit md:max-w-sm'>
      <Image src={imgPath} width={100} height={100} className='mx-auto select-none'/>
      <h3 className='text-lg font-bold pt-8 pb-2 dark:text-white'>{title}</h3>
      <p className='text-gray-800 py-2 dark:text-white'>{desc}</p>
    </div>
  );
}

export default function App() {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [isClicked, setIsClicked] = useState(false);
  const cursorOutline = useRef(null);
  const [darkMode, setDarkMode] = useState(false);

  const handleCursor = (e) => {
    console.log(e.clientX, e.clientY);
    setX(e.clientX - 16);
    setY(e.clientY - 16);
  };
  
  const handleMouseDown = () => {
    setIsClicked(true);
    console.log("clicked");
    cursorOutline.current.classList.add('cursor-clicked');
    cursorOutline.current.classList.remove('cursor');
  };

  const handleMouseUp = () => {
    setIsClicked(false);
    cursorOutline.current.classList.remove('cursor-clicked');
    cursorOutline.current.classList.add('cursor');
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleCursor);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleCursor);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    }
  }, []);

  return (
    <div className={darkMode ? "dark" : ""}>
      <Head>
          <title>Youssef Jarray - Portfolio</title>
          <meta name="desc" content=""></meta>
          <link rel='icon' href='/favicon.ico'></link>
      </Head>
      <motion.div ref={cursorOutline} transition={{ delay: 0, type: "Tween" }}  className='cursor' animate={{
          translateX : x,
          translateY : y,
        }}></motion.div>
        <motion.div transition={{ delay: -100, type: "Tween" }} className='cursor-dot' animate={{
          translateX : x,
          translateY : y,
        }}></motion.div>
      <main className='bg-white px-10 md:px-20 lg:px-40 dark:bg-gray-900 transition-all duration-300'>
        <header>
          <nav className='py-10 mb-10 flex justify-between'>
            <h1 className='text-2xl font-Inter font-black bg-gradient-to-br from-teal-500 to-cyan-500 bg-clip-text text-transparent'>YJ</h1>
            <ul className='flex items-center'>
              <li><BiAdjust onClick={() => setDarkMode(!darkMode)} className='dark:text-white'/></li>
              <li>
                <a className='bg-gray-300 text-black hover:bg-gradient-to-br hover:from-teal-500 hover:to-cyan-500 hover:text-white px-4 py-2 rounded-md ml-4 dark:bg-gray-950 dark:text-white' href='#'>Resume</a>
              </li>
            </ul>
          </nav>
        </header>
        <section>
          <div className='text-center p-10'>
            <h2 className='font-black text-5xl mb-5 leading-snug md:leading-relaxed md:text-4xl lg:text-6xl dark:text-white'>Hello there, My name is <br/><span className='bg-gradient-to-br from-teal-500 to-cyan-500 bg-clip-text text-transparent hover:text-black dark:hover:text-white transition-all duration-500 delay-500'>Youssef Jarray</span></h2>
            <h3 className='text-2xl py-2 font-semibold dark:text-white'>I'm a Developer/Designer</h3>
            <p className='text-md py-5 leading-8 text-gray-800 md:text-lg max-w-xl mx-auto dark:text-white'>
              Computer science student who loves to design during free time. You can find my socials down below!
            </p>
          </div> 
          <div className='text-2xl flex justify-center gap-10 text-cyan-500'>
            <BsDiscord/>
            <BsTwitter/>
            <BsFacebook/>
            <BsYoutube/>
          </div>
          <div className='relative bg-gradient-to-b from-cyan-500 w-80 h-80 rounded-full select-none pointer-events-none my-20 mx-auto overflow-hidden md:h-96 md:w-96'>
            <Image src="/me.png" fill objectFit='cover'/>
          </div>
        </section>
        <section>
          <div>
            <h3 className='text-2xl py-1 font-semibold dark:text-white'>My Story</h3>
            <p className='text-gray-800 leading-8 py-2 dark:text-white'>
            Hey there!
            I'm a computer science student who loves diving into programming languages and web development. I've been honing my skills through my university studies and online courses, exploring everything from Java to C and C++. I've also delved into creating web applications using HTML, CSS, and JavaScript. Learning is my jam, and I'm always on the lookout for new ways to expand my knowledge and skills. I can't wait to share my projects with you and show you how I can put my expertise into action. Thanks for checking out my portfolio!
            Cheers,
            </p>
          </div>
          <div className='lg:flex lg:justify-center gap-10'>
            <Card imgPath={'/code.png'} title={'Skills'} desc={'I code in multiple Languages! including C, C++, Java and i\'ve also dabbled in WebDev using HTML, CSS and JS frameworks like react and Next.JS'}/>
            <Card imgPath={'/design.png'} title={'Design'} desc={'I\'m a self-taught designer with experience in the most Popular Adobe Programs, including Photoshop and Illustrator'}/>
            <Card imgPath={'/consulting.png'} title={'Likes'} desc={'I like to code and hang out with my friends in my free time, but i also love learning new things that will help me further advance my career in the future!'}/>
          </div>
        </section>
      </main>
    </div>
  )
}
