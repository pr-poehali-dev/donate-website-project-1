import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: number;
  name: string;
  amount: number;
  price: number;
  discount?: number;
  image: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface Review {
  id: number;
  username: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface PurchaseLog {
  id: number;
  player_id: string;
  product_name: string;
  amount: number;
  price: number;
  created_at: string;
}

const products: Product[] = [
  { id: 1, name: '100 GOLD', amount: 100, price: 89, discount: 15, image: 'https://cdn.poehali.dev/projects/87ecf3a4-ad58-4229-983f-07129648aebd/files/ef08534c-7e01-42f0-9c06-7b3b4c0f3f84.jpg' },
  { id: 2, name: '500 GOLD', amount: 500, price: 399, discount: 15, image: 'https://cdn.poehali.dev/projects/87ecf3a4-ad58-4229-983f-07129648aebd/files/ef08534c-7e01-42f0-9c06-7b3b4c0f3f84.jpg' },
  { id: 3, name: '1000 GOLD', amount: 1000, price: 799, discount: 25, image: 'https://cdn.poehali.dev/projects/87ecf3a4-ad58-4229-983f-07129648aebd/files/d0e291fe-7024-4999-9c27-265636d7e3d5.jpg' },
  { id: 4, name: '3000 GOLD', amount: 3000, price: 1899, discount: 45, image: 'https://cdn.poehali.dev/projects/87ecf3a4-ad58-4229-983f-07129648aebd/files/d0e291fe-7024-4999-9c27-265636d7e3d5.jpg' },
];

const Index = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [playerId, setPlayerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'sbp'>('card');
  const [promoCode, setPromoCode] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [logs, setLogs] = useState<PurchaseLog[]>([]);
  const [newReview, setNewReview] = useState({ username: '', rating: 5, comment: '' });
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
    if (isAdminMode) {
      fetchLogs();
      const interval = setInterval(fetchLogs, 5000);
      return () => clearInterval(interval);
    }
  }, [isAdminMode]);

  const fetchReviews = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/a48a7cce-0558-4d65-8e02-c5ff50b9383d');
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/ea42ef32-7098-446d-936d-62f11eb12b67');
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    toast({
      title: 'Добавлено в корзину',
      description: `${product.name} добавлен в корзину`,
    });
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
    toast({
      title: 'Удалено',
      description: 'Товар удален из корзины',
    });
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: 'Корзина пуста',
        description: 'Добавьте товары в корзину',
        variant: 'destructive',
      });
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handlePromoCode = () => {
    if (promoCode.toLowerCase() === 'logistand2') {
      setIsAdminMode(true);
      toast({
        title: '✅ Промокод активирован',
        description: 'Открыт доступ к панели администратора',
      });
      setPromoCode('');
    } else {
      toast({
        title: '❌ Неверный промокод',
        description: 'Проверьте правильность ввода',
        variant: 'destructive',
      });
    }
  };

  const handlePayment = async () => {
    if (!playerId || playerId.length < 5) {
      toast({
        title: 'Ошибка',
        description: 'Введите корректный ID игрока (минимум 5 символов)',
        variant: 'destructive',
      });
      return;
    }

    for (const item of cart) {
      try {
        await fetch('https://functions.poehali.dev/ea42ef32-7098-446d-936d-62f11eb12b67', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            player_id: playerId,
            product_name: item.name,
            amount: item.amount,
            price: item.price
          })
        });
      } catch (error) {
        console.error('Error logging purchase:', error);
      }
    }

    toast({
      title: '✅ Успешно!',
      description: 'Оплата прошла успешно. Золото зачислено на ваш аккаунт.',
      duration: 5000,
    });
    
    setCart([]);
    setPlayerId('');
    setIsCheckoutOpen(false);
  };

  const handleSubmitReview = async () => {
    if (!newReview.username || !newReview.comment) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/a48a7cce-0558-4d65-8e02-c5ff50b9383d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      });

      if (response.ok) {
        toast({
          title: '✅ Отзыв отправлен',
          description: 'Спасибо за ваш отзыв!',
        });
        setNewReview({ username: '', rating: 5, comment: '' });
        fetchReviews();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить отзыв',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#1a2332] text-white relative overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="snowflake"
          style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 3 + 2}s`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        >
          ❄
        </div>
      ))}

      <header className="relative z-10 px-4 py-4 md:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold">
              <span className="text-white">STAN</span>
              <span className="text-[#fb923c]">DOFF</span>
              <span className="text-white"> 2</span>
            </h1>
          </div>
          
          <nav className="flex items-center gap-4 md:gap-6">
            <a href="#tariffs" className="text-amber-400 hover:text-amber-300">GOLD</a>
            <a href="#promocodes" className="hover:text-amber-300">ПРОМОКОДЫ</a>
            <a href="#reviews" className="hover:text-amber-300">ОТЗЫВЫ</a>
            {isAdminMode && <a href="#logs" className="text-red-400 hover:text-red-300">ЛОГИ</a>}
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" className="relative hover:bg-white/10">
                  <Icon name="ShoppingCart" size={24} />
                  {cart.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-[#fb923c] text-white border-0">
                      {cart.length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-[#1a2332] border-[#2a3542] w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle className="text-white text-2xl font-bold">Корзина</SheetTitle>
                </SheetHeader>
                <div className="mt-8 space-y-4 h-[calc(100vh-200px)] overflow-y-auto">
                  {cart.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-xl font-bold text-white mb-2">В КОРЗИНЕ НИЧЕГО НЕТ</p>
                      <p className="text-gray-400 mb-6">Воспользуйтесь каталогом<br />для покупки товаров</p>
                      <Button className="bg-[#fb923c] hover:bg-[#f97316] text-white font-bold">
                        ПЕРЕЙТИ К КАТАЛОГУ
                      </Button>
                    </div>
                  ) : (
                    <>
                      {cart.map(item => (
                        <Card key={item.id} className="bg-[#2a3542] border-0 p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                              <div>
                                <p className="font-semibold text-white">{item.name}</p>
                                <p className="text-[#fb923c] text-lg font-bold">{item.price} ₽</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.id)}
                              className="hover:bg-red-500/20 hover:text-red-400"
                            >
                              <Icon name="Trash2" size={20} />
                            </Button>
                          </div>
                        </Card>
                      ))}
                      <div className="pt-4 border-t border-[#2a3542] sticky bottom-0 bg-[#1a2332]">
                        <div className="flex justify-between text-xl font-bold mb-4">
                          <span>Итого:</span>
                          <span className="text-[#fb923c]">{getTotalPrice()} ₽</span>
                        </div>
                        <Button 
                          className="w-full bg-[#fb923c] hover:bg-[#f97316] text-white font-bold py-6 text-lg"
                          onClick={handleCheckout}
                        >
                          ОПЛАТИТЬ
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
            
            <Button variant="ghost" className="hover:bg-white/10">
              <Icon name="User" size={24} />
              <span className="ml-2 hidden md:inline">АВТОРИЗОВАТЬСЯ</span>
            </Button>
          </nav>
        </div>
      </header>

      <main className="relative z-10 px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden mb-12">
            <img 
              src="https://cdn.poehali.dev/projects/87ecf3a4-ad58-4229-983f-07129648aebd/files/c578b2e0-f57f-44cd-b420-addf15821342.jpg" 
              alt="Hero" 
              className="w-full h-[400px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a2332] via-transparent to-transparent"></div>
          </div>

          <section id="tariffs" className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-8 text-amber-400">ТАРИФЫ</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map(product => (
                <Card 
                  key={product.id} 
                  className="bg-gradient-to-b from-[#2a3542] to-[#1f2937] border-2 border-amber-800/30 hover:border-amber-600/50 transition-all duration-300 relative overflow-hidden group"
                >
                  {product.discount && (
                    <Badge className="absolute top-4 right-4 bg-red-500 text-white border-0 font-bold text-base px-3 py-1">
                      -{product.discount}%
                    </Badge>
                  )}
                  <div className="p-6 text-center">
                    <div className="relative mb-6">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-40 object-contain drop-shadow-[0_0_30px_rgba(251,146,60,0.5)] group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="text-3xl font-bold mb-4 text-amber-400">
                      G {product.amount}
                    </h3>
                    <Button 
                      className="w-full bg-[#fb923c] hover:bg-[#f97316] text-white font-bold py-4 text-xl rounded-lg"
                      onClick={() => addToCart(product)}
                    >
                      {product.price} ₽
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section id="promocodes" className="mb-20">
            <Card className="bg-[#2a3542] border-amber-800/30 p-8">
              <h2 className="text-2xl font-bold mb-6 text-amber-400">ПРОМОКОДЫ</h2>
              <div className="flex gap-4">
                <Input
                  placeholder="Введите промокод"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="bg-[#1a2332] border-[#3a4552] text-white text-lg"
                />
                <Button 
                  onClick={handlePromoCode}
                  className="bg-[#fb923c] hover:bg-[#f97316] text-white font-bold px-8"
                >
                  ПРИМЕНИТЬ
                </Button>
              </div>
            </Card>
          </section>

          <section id="reviews" className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-8 text-amber-400">ОТЗЫВЫ</h2>
            <Tabs defaultValue="list" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-[#2a3542]">
                <TabsTrigger value="list" className="data-[state=active]:bg-[#fb923c]">Все отзывы</TabsTrigger>
                <TabsTrigger value="add" className="data-[state=active]:bg-[#fb923c]">Оставить отзыв</TabsTrigger>
              </TabsList>
              
              <TabsContent value="list" className="space-y-4">
                {reviews.length === 0 ? (
                  <Card className="bg-[#2a3542] p-8 text-center">
                    <p className="text-gray-400">Пока нет отзывов. Будьте первым!</p>
                  </Card>
                ) : (
                  reviews.map(review => (
                    <Card key={review.id} className="bg-[#2a3542] border-amber-800/30 p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-bold text-lg">{review.username}</p>
                          <div className="flex gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Icon 
                                key={i} 
                                name="Star" 
                                size={16} 
                                className={i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-500'}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-400">
                          {new Date(review.created_at).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                      <p className="text-gray-300">{review.comment}</p>
                    </Card>
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="add">
                <Card className="bg-[#2a3542] border-amber-800/30 p-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white mb-2 block">Ваше имя</Label>
                      <Input
                        placeholder="Введите имя"
                        value={newReview.username}
                        onChange={(e) => setNewReview({...newReview, username: e.target.value})}
                        className="bg-[#1a2332] border-[#3a4552] text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white mb-2 block">Оценка</Label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setNewReview({...newReview, rating: star})}
                            className="hover:scale-110 transition-transform"
                          >
                            <Icon 
                              name="Star" 
                              size={32} 
                              className={star <= newReview.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-500'}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-white mb-2 block">Комментарий</Label>
                      <Textarea
                        placeholder="Напишите ваш отзыв"
                        value={newReview.comment}
                        onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                        className="bg-[#1a2332] border-[#3a4552] text-white min-h-[120px]"
                      />
                    </div>
                    <Button 
                      onClick={handleSubmitReview}
                      className="w-full bg-[#fb923c] hover:bg-[#f97316] text-white font-bold py-3"
                    >
                      ОТПРАВИТЬ ОТЗЫВ
                    </Button>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </section>

          {isAdminMode && (
            <section id="logs" className="mb-20">
              <Card className="bg-[#2a3542] border-red-500/50 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Icon name="Shield" className="text-red-400" />
                  <h2 className="text-2xl font-bold text-red-400">ПАНЕЛЬ АДМИНИСТРАТОРА - ЛОГИ ПОКУПОК</h2>
                </div>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {logs.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">Логи пусты</p>
                  ) : (
                    logs.map(log => (
                      <div key={log.id} className="bg-[#1a2332] p-3 rounded text-sm font-mono">
                        <span className="text-gray-400">{new Date(log.created_at).toLocaleString('ru-RU')}</span>
                        {' | '}
                        <span className="text-amber-400">ID: {log.player_id}</span>
                        {' | '}
                        <span className="text-green-400">{log.product_name}</span>
                        {' | '}
                        <span className="text-white">{log.amount}G</span>
                        {' | '}
                        <span className="text-[#fb923c]">{log.price}₽</span>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </section>
          )}
        </div>
      </main>

      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="bg-[#1a2332] border-[#2a3542] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">ВВЕДИТЕ СВОЙ ID</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div>
              <Input
                id="playerId"
                placeholder="Введите ID"
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
                className="bg-[#2a3542] border-[#3a4552] text-white text-lg h-12"
              />
              <p className="text-sm text-gray-400 mt-2 text-center cursor-pointer hover:text-amber-400">
                КАК УЗНАТЬ ID?
              </p>
            </div>

            <div>
              <Label className="text-white/80 mb-3 block text-center">СПОСОБ ОПЛАТЫ</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-[#fb923c] bg-[#fb923c]/20'
                      : 'border-[#3a4552] bg-[#2a3542] hover:border-[#fb923c]/50'
                  }`}
                >
                  <Icon name="CreditCard" className="mx-auto mb-2" />
                  <p className="text-sm font-semibold">Новая карта</p>
                </button>
                <button
                  onClick={() => setPaymentMethod('sbp')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === 'sbp'
                      ? 'border-[#fb923c] bg-[#fb923c]/20'
                      : 'border-[#3a4552] bg-[#2a3542] hover:border-[#fb923c]/50'
                  }`}
                >
                  <Icon name="Smartphone" className="mx-auto mb-2" />
                  <p className="text-sm font-semibold">СБП</p>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-[#2a3542]">
              <div className="flex justify-between text-xl font-bold mb-4">
                <span>{cart.length} товар</span>
                <span className="text-[#fb923c]">{getTotalPrice()} ₽</span>
              </div>
              <Button 
                className="w-full bg-[#fb923c] hover:bg-[#f97316] text-white font-bold py-6 text-lg"
                onClick={handlePayment}
              >
                ОПЛАТИТЬ
              </Button>
              <p className="text-xs text-gray-400 mt-3 text-center">
                Нажимая кнопку "Оплатить", Вы подтверждаете, что ознакомились и согласны с положениями Публичной оферты и Политикой конфиденциальности
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <footer className="relative z-10 mt-20 py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-6">
            <p className="text-gray-400 text-sm mb-4">AXLEBOLT</p>
            <div className="flex justify-center gap-6 mb-4">
              <a href="https://t.me/HellwayYTBadlion" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Icon name="Send" size={24} />
              </a>
              <Icon name="MessageCircle" className="text-gray-400 hover:text-white cursor-pointer" />
              <Icon name="Mail" className="text-gray-400 hover:text-white cursor-pointer" />
              <Icon name="Youtube" className="text-gray-400 hover:text-white cursor-pointer" />
            </div>
            <p className="text-sm text-amber-400 mb-2">
              Техподдержка: <a href="https://t.me/HellwayYTBadlion" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300">@HellwayYTBadlion</a>
            </p>
            <p className="text-xs text-gray-500">
              © 2025 Axlebolt MP FZ-LLC All rights reserved. 18+
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
