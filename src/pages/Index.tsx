import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
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

const products: Product[] = [
  { id: 1, name: '100 GOLD', amount: 100, price: 119, discount: 15, image: 'https://cdn.poehali.dev/projects/87ecf3a4-ad58-4229-983f-07129648aebd/files/ef08534c-7e01-42f0-9c06-7b3b4c0f3f84.jpg' },
  { id: 2, name: '500 GOLD', amount: 500, price: 499, discount: 15, image: 'https://cdn.poehali.dev/projects/87ecf3a4-ad58-4229-983f-07129648aebd/files/ef08534c-7e01-42f0-9c06-7b3b4c0f3f84.jpg' },
  { id: 3, name: '1000 GOLD', amount: 1000, price: 899, discount: 25, image: 'https://cdn.poehali.dev/projects/87ecf3a4-ad58-4229-983f-07129648aebd/files/d0e291fe-7024-4999-9c27-265636d7e3d5.jpg' },
  { id: 4, name: '3000 GOLD', amount: 3000, price: 1999, discount: 45, image: 'https://cdn.poehali.dev/projects/87ecf3a4-ad58-4229-983f-07129648aebd/files/d0e291fe-7024-4999-9c27-265636d7e3d5.jpg' },
];

const Index = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [playerId, setPlayerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'sbp'>('card');
  const { toast } = useToast();

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

  const handlePayment = () => {
    if (!playerId || playerId.length < 5) {
      toast({
        title: 'Ошибка',
        description: 'Введите корректный ID игрока (минимум 5 символов)',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: '✅ Успешно!',
      description: 'Оплата прошла успешно. Золото зачислено на ваш аккаунт.',
    });
    setCart([]);
    setPlayerId('');
    setIsCheckoutOpen(false);
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

      <header className="relative z-10 px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold">
              <span className="text-white">STAN</span>
              <span className="text-[#fb923c]">DOFF</span>
              <span className="text-white"> 2</span>
            </h1>
          </div>
          
          <nav className="flex items-center gap-4 md:gap-6">
            <Button variant="ghost" className="text-amber-400 hover:text-amber-300 hover:bg-white/10">
              GOLD
            </Button>
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
              <SheetContent className="bg-[#1a2332] border-[#2a3542]">
                <SheetHeader>
                  <SheetTitle className="text-white text-2xl font-bold">Корзина</SheetTitle>
                </SheetHeader>
                <div className="mt-8 space-y-4">
                  {cart.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">Корзина пуста</p>
                  ) : (
                    <>
                      {cart.map(item => (
                        <Card key={item.id} className="bg-[#2a3542] border-0 p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                              <div>
                                <p className="font-semibold text-white">{item.name}</p>
                                <p className="text-[#fb923c] text-sm">{item.price} ₽</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.id)}
                              className="hover:bg-red-500/20 hover:text-red-400"
                            >
                              <Icon name="Trash2" size={18} />
                            </Button>
                          </div>
                        </Card>
                      ))}
                      <div className="pt-4 border-t border-[#2a3542]">
                        <div className="flex justify-between text-lg font-bold mb-4">
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
            <Button variant="ghost" className="hover:bg-white/10 md:hidden">
              <Icon name="Menu" size={24} />
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <Card 
                key={product.id} 
                className="bg-gradient-to-b from-[#2a3542] to-[#1f2937] border-2 border-amber-800/30 hover:border-amber-600/50 transition-all duration-300 relative overflow-hidden group"
              >
                {product.discount && (
                  <Badge className="absolute top-4 right-4 bg-red-500 text-white border-0 font-bold">
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
                  <h3 className="text-2xl font-bold mb-4 text-amber-400">
                    G {product.amount}
                  </h3>
                  <Button 
                    className="w-full bg-[#fb923c] hover:bg-[#f97316] text-white font-bold py-3 text-lg rounded-lg"
                    onClick={() => addToCart(product)}
                  >
                    {product.price} ₽
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="bg-[#1a2332] border-[#2a3542] text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">ВВЕДИТЕ СВОЙ ID</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div>
              <Label htmlFor="playerId" className="text-white/80 mb-2 block">
                Введите ID
              </Label>
              <Input
                id="playerId"
                placeholder="Введите ID"
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
                className="bg-[#2a3542] border-[#3a4552] text-white placeholder:text-gray-500"
              />
              <p className="text-sm text-gray-400 mt-2 cursor-pointer hover:text-amber-400">
                КАК УЗНАТЬ ID?
              </p>
            </div>

            <div>
              <Label className="text-white/80 mb-3 block">СПОСОБ ОПЛАТЫ</Label>
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
              <div className="flex justify-between text-lg font-bold mb-4">
                <span>1 товар</span>
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
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <p className="text-gray-400 text-sm mb-4">AXLEBOLT</p>
          <div className="flex justify-center gap-4 mb-4">
            <Icon name="Send" className="text-gray-400 hover:text-white cursor-pointer" />
            <Icon name="MessageCircle" className="text-gray-400 hover:text-white cursor-pointer" />
            <Icon name="Mail" className="text-gray-400 hover:text-white cursor-pointer" />
            <Icon name="Youtube" className="text-gray-400 hover:text-white cursor-pointer" />
          </div>
          <p className="text-xs text-gray-500">
            © 2025 Axlebolt MP FZ-LLC All rights reserved. 18+
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
