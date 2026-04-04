import Navbar from './components/home/Navbar';
import HeroBanner from './components/home/HeroBanner';
import ProductSwiper from './components/home/ProductSwiper';
import NewArrival from './components/NewArrival';
import FeaturedDeals from './components/home/FeaturedDeals';
import Footer from './components/home/Footer';

export default function Home() {
    return (
        <div className='min-h-screen bg-white no-scrollbar'>
            <Navbar />
            <HeroBanner />
            <ProductSwiper title='Trending Now' />
            <FeaturedDeals />
            <NewArrival />
            <ProductSwiper title='Best Sellers' sort='popular' />
            <Footer />
        </div>
    );
}